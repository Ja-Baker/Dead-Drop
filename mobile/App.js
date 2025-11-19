import React, { useMemo, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, FlatList, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const palette = {
  black: '#050505',
  white: '#F8F8F8',
  red: '#F40B29',
  gray: '#1E1E1E'
};

const API_URL = 'http://localhost:4000';

const copy = {
  onboarding: [
    {
      title: 'Everyone Dies',
      body: "You're hoarding memes. Dead Drop makes sure they detonate when you don't check in."
    },
    {
      title: 'Pick Your Executors',
      body: 'Friends, enemies, the group chat. They hold the keys and the chaos.'
    },
    {
      title: 'Load the Vaults',
      body: 'Receipts, confessions, funeral playlists. We release when you go silent.'
    }
  ],
  proofOfLife: 'I\'M STILL ALIVE',
  createVault: 'CREATE VAULT',
  sendExecutors: 'SEND TO EXECUTORS'
};

const mockVaults = [
  {
    id: 'vault-1',
    name: 'THE VAULT',
    icon: '🪦',
    trigger: '180 days dark',
    executors: 3,
    contentCount: 12,
    tone: 'Too spicy for daytime viewing.'
  },
  {
    id: 'vault-2',
    name: 'GROUPCHAT NUKE',
    icon: '💣',
    trigger: 'Manual chaos button',
    executors: 5,
    contentCount: 42,
    tone: 'Drops memes + receipts to the squad.'
  }
];

const mockExecutors = [
  { id: 'exe-1', name: 'Maya', contact: 'maya@chaos.club', level: 'Primary' },
  { id: 'exe-2', name: 'DeShawn', contact: '+1 (555) 404-9999', level: 'Curator' },
  { id: 'exe-3', name: 'Leah', contact: 'leah@memorials.xyz', level: 'Viewer' }
];

const mockMemorial = {
  slug: 'sam-ghost-archive',
  headline: 'Sam Rao // 1993-2069',
  reach: '247 humans will see this drop',
  reactions: ['💀', '😭', '🕊️', '😂']
};

const ScreenFrame = ({ title, children, actionBar }) => (
  <SafeAreaView style={styles.safe}>
    <StatusBar style="light" />
    <View style={styles.screenHeader}>
      <Text style={styles.screenTitle}>{title}</Text>
      {actionBar}
    </View>
    <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 32 }}>
      {children}
    </ScrollView>
  </SafeAreaView>
);

const OnboardingScreen = ({ onNext }) => (
  <ScreenFrame
    title="DEAD DROP"
    actionBar={<Pressable style={styles.redPill} onPress={onNext}><Text style={styles.redPillText}>CREATE FIRST VAULT</Text></Pressable>}
  >
    {copy.onboarding.map((slide) => (
      <View key={slide.title} style={styles.card}>
        <Text style={styles.cardTitle}>{slide.title}</Text>
        <Text style={styles.cardBody}>{slide.body}</Text>
      </View>
    ))}
    <View style={styles.disclaimer}>
      <Text style={styles.disclaimerTitle}>LEGAL REALITY CHECK</Text>
      <Text style={styles.cardBody}>By tapping continue you accept that we launch your drop when the triggers fire. No whining from the afterlife.</Text>
    </View>
  </ScreenFrame>
);

const DashboardScreen = ({ onProof, onNav }) => (
  <ScreenFrame
    title="YOUR DROPS"
    actionBar={<Pressable style={styles.proofBtn} onPress={onProof}><Text style={styles.proofBtnText}>{copy.proofOfLife}</Text></Pressable>}
  >
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>LAST CHECK-IN</Text>
      <Text style={styles.metaValue}>12 days ago</Text>
    </View>
    <View style={styles.metaRow}>
      <Text style={styles.metaLabel}>EXECUTORS</Text>
      <Text style={styles.metaValue}>5 watching you</Text>
    </View>
    <FlatList
      data={mockVaults}
      scrollEnabled={false}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.vaultTile}>
          <Text style={styles.vaultTitle}>{item.icon} {item.name}</Text>
          <Text style={styles.vaultMeta}>{item.trigger}</Text>
          <Text style={styles.vaultMeta}>{item.executors} executors • {item.contentCount} files</Text>
          <Text style={styles.cardBody}>{item.tone}</Text>
        </View>
      )}
    />
    <Pressable style={styles.redPill} onPress={() => onNav('vault')}>
      <Text style={styles.redPillText}>{copy.createVault}</Text>
    </Pressable>
    <Pressable style={styles.linkBtn} onPress={() => onNav('memorial')}>
      <Text style={styles.linkText}>PREVIEW MEMORIAL</Text>
    </Pressable>
  </ScreenFrame>
);

const VaultBuilderScreen = ({ onDone }) => (
  <ScreenFrame title="BUILD A DROP">
    <View style={styles.card}>
      <Text style={styles.metaLabel}>NAME IT</Text>
      <Text style={styles.cardBody}>THE RECEIPTS</Text>
    </View>
    <View style={styles.card}>
      <Text style={styles.metaLabel}>ICON</Text>
      <Text style={styles.cardBody}>🧨</Text>
    </View>
    <View style={styles.card}>
      <Text style={styles.metaLabel}>TRIGGER</Text>
      <Text style={styles.cardBody}>180 days offline + executor vote</Text>
    </View>
    <View style={styles.card}>
      <Text style={styles.metaLabel}>CONTENT</Text>
      <Text style={styles.cardBody}>Add images, audio, voice notes, URLs and encrypted confessions. All AES-256 before it leaves the phone.</Text>
    </View>
    <Pressable style={styles.redPill} onPress={onDone}>
      <Text style={styles.redPillText}>{copy.sendExecutors}</Text>
    </Pressable>
  </ScreenFrame>
);

const ExecutorScreen = () => (
  <ScreenFrame title="EXECUTORS">
    {mockExecutors.map((executor) => (
      <View key={executor.id} style={styles.executorRow}>
        <View>
          <Text style={styles.cardTitle}>{executor.name}</Text>
          <Text style={styles.cardBody}>{executor.contact}</Text>
        </View>
        <Text style={styles.metaValue}>{executor.level}</Text>
      </View>
    ))}
    <Pressable style={styles.linkBtn}>
      <Text style={styles.linkText}>INVITE ANOTHER AGENT</Text>
    </Pressable>
  </ScreenFrame>
);

const MemorialScreen = () => (
  <ScreenFrame title="MEMORIAL WALL">
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{mockMemorial.headline}</Text>
      <Text style={styles.cardBody}>{mockMemorial.reach}</Text>
      <Text style={styles.metaLabel}>REACTIONS</Text>
      <Text style={styles.cardBody}>{mockMemorial.reactions.join('   ')}</Text>
      <Text style={styles.metaLabel}>CTA</Text>
      <Text style={styles.cardBody}>Create yours. Death is the ultimate referral program.</Text>
    </View>
  </ScreenFrame>
);

const SettingsScreen = () => (
  <ScreenFrame title="SETTINGS">
    <View style={styles.card}>
      <Text style={styles.metaLabel}>PLAN</Text>
      <Text style={styles.cardBody}>Eternal Plan — $49/year, billed until the heat death of the universe.</Text>
    </View>
    <View style={styles.card}>
      <Text style={styles.metaLabel}>SECURITY</Text>
      <Text style={styles.cardBody}>2FA mandatory. FaceID unlock. Auto logout after 5 minutes of inactivity.</Text>
    </View>
    <View style={styles.card}>
      <Text style={styles.metaLabel}>LEGAL</Text>
      <Text style={styles.cardBody}>Terms of Service, Privacy Policy, Acceptable Use. No data selling, no excuses.</Text>
    </View>
  </ScreenFrame>
);

const TabButton = ({ label, active, onPress }) => (
  <Pressable onPress={onPress} style={[styles.tabBtn, active && styles.tabBtnActive]}>
    <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
  </Pressable>
);

export default function App() {
  const [screen, setScreen] = useState('onboarding');
  const [status, setStatus] = useState('Waiting for proof of life.');

  const handleProof = async () => {
    try {
      setStatus('Pinging backend...');
      const response = await fetch(`${API_URL}/api/triggers/proof-of-life`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer demo-token' }
      });
      if (!response.ok) throw new Error('Network error');
      const payload = await response.json();
      setStatus(payload.message);
    } catch (error) {
      setStatus('Proof logged locally. Connect to the API to make it official.');
    }
  };

  const mainScreen = useMemo(() => {
    switch (screen) {
      case 'dashboard':
        return <DashboardScreen onProof={handleProof} onNav={setScreen} />;
      case 'vault':
        return <VaultBuilderScreen onDone={() => setScreen('executors')} />;
      case 'executors':
        return <ExecutorScreen />;
      case 'memorial':
        return <MemorialScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <OnboardingScreen onNext={() => setScreen('dashboard')} />;
    }
  }, [screen]);

  return (
    <View style={styles.app}>
      {mainScreen}
      {screen !== 'onboarding' && (
        <View style={styles.navBar}>
          {['dashboard', 'executors', 'vault', 'settings', 'memorial'].map((tab) => (
            <TabButton
              key={tab}
              label={tab.toUpperCase()}
              active={screen === tab}
              onPress={() => setScreen(tab)}
            />
          ))}
        </View>
      )}
      <View style={styles.statusBanner}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: palette.black
  },
  safe: {
    flex: 1,
    backgroundColor: palette.black,
    paddingHorizontal: 20
  },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16
  },
  screenTitle: {
    color: palette.white,
    fontFamily: 'Helvetica',
    fontSize: 24,
    letterSpacing: 2
  },
  scroll: {
    flex: 1
  },
  card: {
    borderWidth: 2,
    borderColor: palette.white,
    padding: 16,
    marginBottom: 16,
    backgroundColor: palette.gray
  },
  cardTitle: {
    color: palette.white,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4
  },
  cardBody: {
    color: palette.white,
    fontSize: 14,
    lineHeight: 20
  },
  disclaimer: {
    borderWidth: 2,
    borderColor: palette.red,
    padding: 16,
    marginBottom: 16
  },
  disclaimerTitle: {
    color: palette.red,
    fontWeight: '700',
    marginBottom: 8
  },
  redPill: {
    backgroundColor: palette.red,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16
  },
  redPillText: {
    color: palette.black,
    fontWeight: '800',
    letterSpacing: 1
  },
  proofBtn: {
    borderWidth: 2,
    borderColor: palette.red,
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  proofBtnText: {
    color: palette.red,
    fontWeight: '700'
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  metaLabel: {
    color: '#AAAAAA',
    fontSize: 12,
    letterSpacing: 1
  },
  metaValue: {
    color: palette.white,
    fontSize: 12,
    letterSpacing: 1
  },
  vaultTile: {
    borderWidth: 2,
    borderColor: palette.white,
    padding: 16,
    marginBottom: 12
  },
  vaultTitle: {
    color: palette.white,
    fontSize: 20,
    fontWeight: '700'
  },
  vaultMeta: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 4
  },
  linkBtn: {
    alignItems: 'center',
    padding: 8,
    marginBottom: 16
  },
  linkText: {
    color: palette.white,
    textDecorationLine: 'underline',
    letterSpacing: 1
  },
  executorRow: {
    borderWidth: 2,
    borderColor: palette.white,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 2,
    borderColor: palette.white,
    paddingVertical: 8,
    backgroundColor: palette.black
  },
  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderColor: palette.red
  },
  tabText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '700'
  },
  tabTextActive: {
    color: palette.white
  },
  statusBanner: {
    borderTopWidth: 1,
    borderColor: palette.red,
    padding: 12,
    backgroundColor: palette.gray
  },
  statusText: {
    color: palette.white,
    fontSize: 12,
    textAlign: 'center'
  }
});
