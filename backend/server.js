const express = require('express');
const cors = require('cors');
const { v4: uuid } = require('uuid');
const { differenceInDays } = require('date-fns');
const { readData, updateData } = require('./dataStore');

const PORT = process.env.PORT || 4000;
const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

function brutalCopy(message) {
  return `${message} // DEAD DROP`;
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: brutalCopy('No token. No entry.') });
  }
  const token = authHeader.replace('Bearer ', '').trim();
  const data = readData();
  const session = data.sessions.find((s) => s.token === token);
  if (!session) {
    return res.status(401).json({ error: brutalCopy('Invalid session. Are you a ghost?') });
  }
  const user = data.users.find((u) => u.id === session.userId);
  if (!user) {
    return res.status(401).json({ error: brutalCopy('User missing. Did you delete yourself?') });
  }
  req.user = user;
  req.session = session;
  next();
}

function sanitizeVault(vault) {
  if (!vault) return null;
  const { internalNotes, ...safe } = vault;
  return safe;
}

function ensureMemorial(vaultId) {
  const data = readData();
  const existing = data.memorials.find((m) => m.vaultId === vaultId);
  if (existing) return existing;
  const memorial = {
    id: uuid(),
    vaultId,
    reactions: [],
    comments: [],
    views: 0
  };
  updateData((store) => {
    store.memorials.push(memorial);
    return memorial;
  });
  return memorial;
}

app.get('/', (req, res) => {
  res.json({
    message: brutalCopy('Dead Drop API is breathing. For now.'),
    endpoints: [
      '/api/auth/signup',
      '/api/vaults',
      '/api/executors',
      '/api/triggers/status',
      '/api/memorial/:vaultId'
    ]
  });
});

// AUTH
app.post('/api/auth/signup', (req, res) => {
  const { email, password, name, plan = 'basic' } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: brutalCopy('Email + password required. Obviously.') });
  }
  const existing = readData().users.find((u) => u.email === email);
  if (existing) {
    return res.status(409).json({ error: brutalCopy('Already signed up. Use login.') });
  }
  const user = {
    id: uuid(),
    email,
    password,
    name: name || 'Ghost User',
    plan,
    lastProofOfLife: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    executors: [],
    settings: {
      checkInFrequencyDays: 30,
      proofOfLifeCopy: 'Tap if you still have a pulse.'
    }
  };
  updateData((data) => {
    data.users.push(user);
    const token = uuid();
    data.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
    res.json({
      message: brutalCopy('Signup complete. Start planning your exit.'),
      token,
      user: { id: user.id, email: user.email, name: user.name, plan: user.plan }
    });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const data = readData();
  const user = data.users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: brutalCopy('Wrong credentials. Try again or haunt IT.') });
  }
  const token = uuid();
  updateData((store) => {
    store.sessions.push({ token, userId: user.id, createdAt: new Date().toISOString() });
  });
  res.json({ message: brutalCopy('Logged in. Try not to die mid-session.'), token });
});

app.post('/api/auth/logout', authenticate, (req, res) => {
  updateData((data) => {
    data.sessions = data.sessions.filter((s) => s.token !== req.session.token);
  });
  res.json({ message: brutalCopy('Logged out. Stay alive out there.') });
});

app.post('/api/auth/refresh', authenticate, (req, res) => {
  const newToken = uuid();
  updateData((data) => {
    data.sessions = data.sessions.filter((s) => s.token !== req.session.token);
    data.sessions.push({ token: newToken, userId: req.user.id, createdAt: new Date().toISOString() });
  });
  res.json({ message: brutalCopy('Token refreshed. Back on the grid.'), token: newToken });
});

app.post('/api/auth/verify-2fa', authenticate, (req, res) => {
  res.json({ message: brutalCopy('2FA placeholder. Assume success.'), verified: true });
});

// Vault routes
app.get('/api/vaults', authenticate, (req, res) => {
  const data = readData();
  const vaults = data.vaults.filter((v) => v.ownerId === req.user.id).map(sanitizeVault);
  res.json({ vaults });
});

app.post('/api/vaults', authenticate, (req, res) => {
  const { name, icon = '💀', trigger = { type: 'inactivity', days: 180 }, executorIds = [] } = req.body;
  const vault = {
    id: uuid(),
    ownerId: req.user.id,
    name: name || 'Untitled Drop',
    icon,
    trigger,
    executorIds,
    content: [],
    createdAt: new Date().toISOString(),
    status: 'draft',
    proofPreviewCopy: brutalCopy('Preview mode. Are you sure?'),
    internalNotes: 'Remember to encrypt everything.'
  };
  updateData((data) => {
    data.vaults.push(vault);
  });
  res.status(201).json({ message: brutalCopy('Vault created. Do something with it.'), vault: sanitizeVault(vault) });
});

app.get('/api/vaults/:id', authenticate, (req, res) => {
  const data = readData();
  const vault = data.vaults.find((v) => v.id === req.params.id && v.ownerId === req.user.id);
  if (!vault) {
    return res.status(404).json({ error: brutalCopy('Vault not found. Maybe it self-destructed.') });
  }
  res.json({ vault: sanitizeVault(vault) });
});

app.put('/api/vaults/:id', authenticate, (req, res) => {
  updateData((data) => {
    const vault = data.vaults.find((v) => v.id === req.params.id && v.ownerId === req.user.id);
    if (!vault) {
      return res.status(404).json({ error: brutalCopy('Vault missing.') });
    }
    Object.assign(vault, req.body, { updatedAt: new Date().toISOString() });
    res.json({ message: brutalCopy('Vault updated. No take-backs.'), vault: sanitizeVault(vault) });
  });
});

app.delete('/api/vaults/:id', authenticate, (req, res) => {
  updateData((data) => {
    data.vaults = data.vaults.filter((v) => !(v.id === req.params.id && v.ownerId === req.user.id));
  });
  res.json({ message: brutalCopy('Vault deleted. Gone forever.') });
});

app.post('/api/vaults/:id/content', authenticate, (req, res) => {
  const { type = 'text', value, metadata = {} } = req.body;
  if (!value) {
    return res.status(400).json({ error: brutalCopy('Content needs content. Shocking.') });
  }
  updateData((data) => {
    const vault = data.vaults.find((v) => v.id === req.params.id && v.ownerId === req.user.id);
    if (!vault) {
      return res.status(404).json({ error: brutalCopy('Vault missing. Did you delete it already?') });
    }
    const item = { id: uuid(), type, value, metadata, addedAt: new Date().toISOString() };
    vault.content.push(item);
    res.status(201).json({ message: brutalCopy('Content stashed.'), item });
  });
});

app.delete('/api/vaults/:id/content/:contentId', authenticate, (req, res) => {
  updateData((data) => {
    const vault = data.vaults.find((v) => v.id === req.params.id && v.ownerId === req.user.id);
    if (!vault) {
      return res.status(404).json({ error: brutalCopy('Vault missing.') });
    }
    vault.content = vault.content.filter((c) => c.id !== req.params.contentId);
    res.json({ message: brutalCopy('Content removed. Hope you meant it.') });
  });
});

app.get('/api/vaults/:id/preview', authenticate, (req, res) => {
  const data = readData();
  const vault = data.vaults.find((v) => v.id === req.params.id && v.ownerId === req.user.id);
  if (!vault) {
    return res.status(404).json({ error: brutalCopy('Vault missing.') });
  }
  res.json({
    preview: {
      title: `${vault.icon} ${vault.name}`,
      reachEstimate: `${vault.content.length * 5 + 100} people will see this mess.`,
      executorCount: vault.executorIds.length,
      trigger: vault.trigger,
      content: vault.content
    }
  });
});

// Executors
app.get('/api/executors', authenticate, (req, res) => {
  const data = readData();
  const executors = data.executors.filter((e) => e.ownerId === req.user.id);
  res.json({ executors });
});

app.post('/api/executors/invite', authenticate, (req, res) => {
  const { name, contact, accessLevel = 'viewer' } = req.body;
  if (!contact) {
    return res.status(400).json({ error: brutalCopy('Executors need contact info. Obviously.') });
  }
  const executor = {
    id: uuid(),
    ownerId: req.user.id,
    name: name || 'Unnamed Executor',
    contact,
    accessLevel,
    invitedAt: new Date().toISOString(),
    status: 'invited'
  };
  updateData((data) => {
    data.executors.push(executor);
  });
  res.status(201).json({ message: brutalCopy('Executor invited. They better answer.'), executor });
});

app.delete('/api/executors/:id', authenticate, (req, res) => {
  updateData((data) => {
    data.executors = data.executors.filter((e) => !(e.id === req.params.id && e.ownerId === req.user.id));
    data.vaults.forEach((vault) => {
      if (vault.ownerId === req.user.id) {
        vault.executorIds = vault.executorIds.filter((id) => id !== req.params.id);
      }
    });
  });
  res.json({ message: brutalCopy('Executor removed. Trust revoked.') });
});

app.put('/api/executors/:id/permissions', authenticate, (req, res) => {
  updateData((data) => {
    const executor = data.executors.find((e) => e.id === req.params.id && e.ownerId === req.user.id);
    if (!executor) {
      return res.status(404).json({ error: brutalCopy('Executor not found.') });
    }
    executor.accessLevel = req.body.accessLevel || executor.accessLevel;
    executor.status = req.body.status || executor.status;
    res.json({ message: brutalCopy('Executor permissions updated.'), executor });
  });
});

app.post('/api/executors/vote-trigger', authenticate, (req, res) => {
  const { vaultId, vote } = req.body;
  if (!vaultId || typeof vote !== 'boolean') {
    return res.status(400).json({ error: brutalCopy('Vault + vote boolean required.') });
  }
  const voteRecord = {
    id: uuid(),
    vaultId,
    voterId: req.user.id,
    vote,
    castAt: new Date().toISOString()
  };
  updateData((data) => {
    data.triggers.push({ ...voteRecord, type: 'executor_vote' });
  });
  res.json({ message: brutalCopy('Vote captured. Democracy in death.'), record: voteRecord });
});

// Triggers
app.get('/api/triggers/status', authenticate, (req, res) => {
  const data = readData();
  const daysQuiet = differenceInDays(new Date(), new Date(req.user.lastProofOfLife));
  res.json({
    status: daysQuiet < 90 ? 'all-clear' : 'warning',
    daysSinceCheckIn: daysQuiet,
    upcomingWarnings: [60, 75, 85].filter((day) => day > daysQuiet)
  });
});

app.post('/api/triggers/proof-of-life', authenticate, (req, res) => {
  updateData((data) => {
    const user = data.users.find((u) => u.id === req.user.id);
    user.lastProofOfLife = new Date().toISOString();
  });
  res.json({ message: brutalCopy('Proof of life received. Congrats on not dying.') });
});

app.post('/api/triggers/manual', authenticate, (req, res) => {
  const { vaultId, reason = 'manual' } = req.body;
  if (!vaultId) {
    return res.status(400).json({ error: brutalCopy('Need a vault to trigger, genius.') });
  }
  const triggerEvent = {
    id: uuid(),
    vaultId,
    reason,
    initiatedBy: req.user.id,
    createdAt: new Date().toISOString(),
    status: 'pending',
    cancelBy: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString()
  };
  updateData((data) => {
    data.triggers.push(triggerEvent);
  });
  res.json({ message: brutalCopy('Manual trigger armed. 72h to cancel.'), trigger: triggerEvent });
});

app.post('/api/triggers/cancel', authenticate, (req, res) => {
  const { triggerId } = req.body;
  updateData((data) => {
    const trigger = data.triggers.find((t) => t.id === triggerId);
    if (!trigger) {
      return res.status(404).json({ error: brutalCopy('Trigger missing.') });
    }
    trigger.status = 'cancelled';
    res.json({ message: brutalCopy('Trigger cancelled. Back to limbo.'), trigger });
  });
});

app.get('/api/triggers/history', authenticate, (req, res) => {
  const data = readData();
  const history = data.triggers.filter((t) => t.initiatedBy === req.user.id);
  res.json({ history });
});

// Memorials
app.get('/api/memorial/:vaultId', (req, res) => {
  const data = readData();
  const vault = data.vaults.find((v) => v.id === req.params.vaultId);
  if (!vault) {
    return res.status(404).json({ error: brutalCopy('Vault not found. Maybe still private.') });
  }
  const memorial = ensureMemorial(vault.id);
  memorial.views += 1;
  updateData((store) => {
    const index = store.memorials.findIndex((m) => m.id === memorial.id);
    store.memorials[index] = memorial;
  });
  res.json({
    vault: sanitizeVault(vault),
    memorial
  });
});

app.post('/api/memorial/:vaultId/react', (req, res) => {
  const { emoji = '💀' } = req.body;
  const memorial = ensureMemorial(req.params.vaultId);
  updateData((data) => {
    const target = data.memorials.find((m) => m.id === memorial.id);
    target.reactions.push({ id: uuid(), emoji, reactedAt: new Date().toISOString() });
  });
  res.status(201).json({ message: brutalCopy('Reaction logged. Internet grieving achieved.') });
});

app.post('/api/memorial/:vaultId/comment', (req, res) => {
  const { author = 'Anonymous', text } = req.body;
  if (!text) {
    return res.status(400).json({ error: brutalCopy('Say something or stay silent.') });
  }
  const memorial = ensureMemorial(req.params.vaultId);
  const comment = { id: uuid(), author, text, postedAt: new Date().toISOString() };
  updateData((data) => {
    const target = data.memorials.find((m) => m.id === memorial.id);
    target.comments.push(comment);
  });
  res.status(201).json({ message: brutalCopy('Comment posted.'), comment });
});

app.get('/api/memorial/:vaultId/stats', (req, res) => {
  const memorial = ensureMemorial(req.params.vaultId);
  res.json({
    stats: {
      views: memorial.views,
      reactions: memorial.reactions.length,
      comments: memorial.comments.length
    }
  });
});

// Subscriptions
app.get('/api/subscription', authenticate, (req, res) => {
  res.json({
    plan: req.user.plan,
    copy: req.user.plan === 'premium' ? 'Eternal Plan active. Die legendary.' : 'Basic tier. Ads on your tombstone.',
    renewsAt: new Date(Date.now() + 31536000000).toISOString()
  });
});

app.post('/api/subscription/checkout', authenticate, (req, res) => {
  const { plan = 'premium' } = req.body;
  const invoice = {
    id: uuid(),
    userId: req.user.id,
    plan,
    amount: plan === 'premium' ? 49 : plan === 'enterprise' ? 199 : 0,
    currency: 'USD',
    createdAt: new Date().toISOString()
  };
  updateData((data) => {
    const user = data.users.find((u) => u.id === req.user.id);
    user.plan = plan;
    data.invoices.push(invoice);
    data.subscriptionEvents.push({
      id: uuid(),
      userId: req.user.id,
      plan,
      event: 'checkout',
      timestamp: invoice.createdAt
    });
  });
  res.status(201).json({ message: brutalCopy('Payment captured. Welcome to the Eternal Plan.'), invoice });
});

app.post('/api/subscription/cancel', authenticate, (req, res) => {
  updateData((data) => {
    const user = data.users.find((u) => u.id === req.user.id);
    user.plan = 'basic';
  });
  res.json({ message: brutalCopy('Subscription cancelled. Back to Basic Death.') });
});

app.get('/api/subscription/invoices', authenticate, (req, res) => {
  const data = readData();
  const invoices = data.invoices.filter((i) => i.userId === req.user.id);
  res.json({ invoices });
});

function startServer(port = PORT) {
  const server = app.listen(port, () => {
    console.log(brutalCopy(`API ready on port ${port}`));
  });
  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
