import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Animated,
  StatusBar,
  Dimensions,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import {
  Gift,
  User,
  Settings,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Home,
  Heart,
  Check
} from 'lucide-react-native';

// --- CONSTANTS & THEME ---

const SCREEN_WIDTH = Dimensions.get('window').width;

const COLORS = {
  bgPrimary: '#FAFAFA',
  bgSecondary: '#FFFFFF',
  bgSubtle: '#F5F3F0',
  textPrimary: '#1F1F1F',
  textSecondary: '#6B6B6B',
  textMuted: '#9CA3AF',
  accentPrimary: '#E85D75', // Soft Coral
  accentSecondary: '#F4A261',
  accentSuccess: '#6BCB77',
  accentSoft: '#FEF0F0',
  border: '#E8E8E8',
  white: '#FFFFFF',
  shadow: 'rgba(0,0,0,0.06)',
};

const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

const FONTS = {
  display: Platform.select({ ios: 'System', android: 'sans-serif-medium' }),
  body: Platform.select({ ios: 'System', android: 'sans-serif' }),
};

// --- TYPES ---

interface Recipient {
  id: string;
  name: string;
  relationship: string;
  ageRange: string;
  gender: string;
  interests: string[];
  dislikes: string;
  budget: string;
  pastGifts: string;
  savedIdeas: GiftIdea[];
}

interface GiftIdea {
  id: string;
  name: string;
  description: string;
  reasoning: string;
  price: string;
  category: string;
  isSaved: boolean;
  isPurchased: boolean;
}

// --- MOCK DATA & UTILS ---

const RELATIONSHIPS = ['Mom', 'Dad', 'Partner', 'Friend', 'Sibling', 'Child', 'Coworker', 'Other'];
const AGE_RANGES = ['Under 18', '18-30', '31-50', '51-70', '70+'];
const INTERESTS_LIST = [
  '🍳 Cooking', '📚 Reading', '🏃 Fitness', '🎮 Gaming',
  '🎨 Art', '🌱 Gardening', '✈️ Travel', '🎵 Music',
  '📸 Photo', '🧘 Wellness', '👗 Fashion', '🔧 DIY',
  '🍷 Wine', '☕ Coffee', '🐕 Pets', '⚽ Sports',
  '💻 Tech', '🎬 Movies'
];

const generateId = () => Math.random().toString(36).substr(2, 9);

const MOCK_GIFT_IDEAS: GiftIdea[] = [
  {
    id: '1',
    name: 'Le Creuset Dutch Oven',
    description: 'Enameled Cast Iron Signature Round Dutch Oven, 5.5 qt.',
    reasoning: 'Perfect for her love of cooking and durable enough to last a lifetime.',
    price: '~$350',
    category: 'Cooking',
    isSaved: false,
    isPurchased: false,
  },
  {
    id: '2',
    name: 'Masterclass Subscription',
    description: 'Annual membership to learn from the world\'s best.',
    reasoning: 'Since she loves learning new skills, she can take cooking classes from Gordon Ramsay.',
    price: '$180/yr',
    category: 'Education',
    isSaved: false,
    isPurchased: false,
  },
  {
    id: '3',
    name: 'Aesop Hand Balm',
    description: 'Resurrection Aromatique Hand Balm',
    reasoning: 'A luxurious treat for her hands after gardening.',
    price: '$30',
    category: 'Wellness',
    isSaved: false,
    isPurchased: false,
  },
  {
    id: '4',
    name: 'Kindle Paperwhite',
    description: 'Waterproof e-reader with adjustable warm light.',
    reasoning: 'Great for reading in the bath or on the go without eye strain.',
    price: '$140',
    category: 'Tech',
    isSaved: false,
    isPurchased: false,
  },
];

// --- COMPONENT LIBRARY ---

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  icon, 
  style, 
  disabled 
}: { 
  title: string; 
  onPress: () => void; 
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'; 
  icon?: React.ReactNode;
  style?: any;
  disabled?: boolean;
}) => {
  const getBgColor = () => {
    if (disabled) return COLORS.bgSubtle;
    switch (variant) {
      case 'primary': return COLORS.accentPrimary;
      case 'secondary': return COLORS.accentSoft;
      case 'ghost': return 'transparent';
      case 'outline': return 'transparent';
      default: return COLORS.accentPrimary;
    }
  };

  const getTextColor = () => {
    if (disabled) return COLORS.textMuted;
    switch (variant) {
      case 'primary': return COLORS.white;
      case 'secondary': return COLORS.accentPrimary;
      case 'ghost': return COLORS.textSecondary;
      case 'outline': return COLORS.accentPrimary;
      default: return COLORS.white;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: getBgColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: variant === 'outline' ? COLORS.accentPrimary : 'transparent',
          shadowOpacity: variant === 'primary' ? 0.1 : 0,
        },
        style,
      ]}
    >
      {icon && <View style={{ marginRight: 8 }}>{icon}</View>}
      <Text style={[styles.buttonText, { color: getTextColor() }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const Card = ({ children, style, onPress }: { children?: React.ReactNode, style?: any, onPress?: () => void, key?: any }) => {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container
      onPress={onPress}
      activeOpacity={onPress ? 0.9 : 1}
      style={[styles.card, style]}
    >
      {children}
    </Container>
  );
};

const FadeInView = ({ children, delay = 0, style }: { children?: React.ReactNode, delay?: number, style?: any, key?: any }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }, style]}>
      {children}
    </Animated.View>
  );
};

// --- SCREENS ---

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.splashContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />
      <FadeInView>
        <View style={styles.splashIconContainer}>
          <Gift size={64} color={COLORS.accentPrimary} strokeWidth={1.5} />
        </View>
        <Text style={styles.splashTitle}>Ribbon</Text>
        <Text style={styles.splashTagline}>Find the perfect gift</Text>
      </FadeInView>
    </View>
  );
};

const OnboardingScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Never struggle with gift ideas again",
      subtitle: "Tell us about the people you care about and we'll handle the rest.",
      icon: <User size={80} color={COLORS.accentPrimary} strokeWidth={1} />,
    },
    {
      title: "Get personalized suggestions",
      subtitle: "Our AI finds unique gifts they'll actually love based on their interests.",
      icon: <Sparkles size={80} color={COLORS.accentPrimary} strokeWidth={1} />,
    },
    {
      title: "Give with confidence",
      subtitle: "Save ideas, track history, and never forget a special occasion.",
      icon: <Gift size={80} color={COLORS.accentPrimary} strokeWidth={1} />,
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.onboardingContent}>
        <View style={styles.onboardingIllustration}>
          <View style={styles.iconCircle}>
            {steps[step].icon}
          </View>
        </View>
        <View style={{ height: 200 }}>
          <Text style={styles.onboardingTitle}>{steps[step].title}</Text>
          <Text style={styles.onboardingSubtitle}>{steps[step].subtitle}</Text>
        </View>
        
        <View style={styles.pagination}>
          {steps.map((_, i) => (
            <View 
              key={i} 
              style={[
                styles.paginationDot, 
                i === step ? styles.paginationDotActive : null
              ]} 
            />
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button 
          title={step === steps.length - 1 ? "Get Started" : "Next"} 
          onPress={handleNext} 
        />
        {step < steps.length - 1 && (
          <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }} onPress={onFinish}>
            <Text style={{ color: COLORS.textSecondary, fontFamily: FONTS.body }}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const HomeScreen = ({ 
  recipients, 
  onAddRecipient, 
  onSelectRecipient 
}: { 
  recipients: Recipient[]; 
  onAddRecipient: () => void;
  onSelectRecipient: (r: Recipient) => void;
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi there! 👋</Text>
          <Text style={styles.subGreeting}>Who are you shopping for?</Text>
        </View>
        <View style={styles.avatarPlaceholder}>
          <User size={20} color={COLORS.white} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View style={styles.searchContainer}>
          <Search size={20} color={COLORS.textMuted} />
          <Text style={styles.searchPlaceholder}>Search people...</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your People</Text>
        </View>

        {recipients.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIcon}>
              <Gift size={40} color={COLORS.textMuted} />
            </View>
            <Text style={styles.emptyStateTitle}>Add your first person</Text>
            <Text style={styles.emptyStateText}>Tell us about someone you're shopping for to get started.</Text>
            <Button 
              title="Add Person" 
              variant="secondary"
              onPress={onAddRecipient} 
              icon={<Plus size={18} color={COLORS.accentPrimary} />}
              style={{ marginTop: 16 }}
            />
          </View>
        ) : (
          <View style={styles.grid}>
            {recipients.map((recipient) => (
              <TouchableOpacity 
                key={recipient.id} 
                style={styles.recipientCard}
                onPress={() => onSelectRecipient(recipient)}
              >
                <View style={[styles.avatar, { backgroundColor: COLORS.accentSoft }]}>
                  <Text style={{ fontSize: 24 }}>
                    {recipient.gender === 'Female' ? '👩' : recipient.gender === 'Male' ? '👨' : '👤'}
                  </Text>
                </View>
                <Text style={styles.recipientName} numberOfLines={1}>{recipient.name}</Text>
                <Text style={styles.recipientRelation}>{recipient.relationship}</Text>
                <View style={styles.occasionBadge}>
                  <Text style={styles.occasionText}>🎂 Birthday</Text>
                </View>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity style={[styles.recipientCard, styles.addRecipientCard]} onPress={onAddRecipient}>
              <View style={[styles.avatar, { backgroundColor: COLORS.bgSubtle }]}>
                <Plus size={24} color={COLORS.textSecondary} />
              </View>
              <Text style={[styles.recipientName, { color: COLORS.textSecondary }]}>Add Person</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.sectionHeader, { marginTop: 32 }]}>
          <Text style={styles.sectionTitle}>Upcoming</Text>
        </View>

        {recipients.length > 0 ? (
           recipients.map(r => (
             <Card key={r.id + 'occ'} style={{ marginBottom: 16, flexDirection: 'row', alignItems: 'center' }} onPress={() => onSelectRecipient(r)}>
               <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.accentSoft, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                 <Text style={{ fontSize: 20 }}>🎂</Text>
               </View>
               <View style={{ flex: 1 }}>
                 <Text style={{ fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, fontFamily: FONTS.display }}>{r.name}'s Birthday</Text>
                 <Text style={{ fontSize: 14, color: COLORS.accentPrimary, marginTop: 2, fontFamily: FONTS.body }}>in 23 days</Text>
               </View>
               <View style={styles.findGiftButton}>
                 <Text style={styles.findGiftText}>Find Gift</Text>
               </View>
             </Card>
           ))
        ) : (
          <View style={styles.emptyUpcoming}>
             <Text style={{ color: COLORS.textMuted, fontFamily: FONTS.body }}>No upcoming occasions yet</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Home size={24} color={COLORS.accentPrimary} />
          <Text style={[styles.navText, { color: COLORS.accentPrimary }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Gift size={24} color={COLORS.textMuted} />
          <Text style={styles.navText}>Occasions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <User size={24} color={COLORS.textMuted} />
          <Text style={styles.navText}>People</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Settings size={24} color={COLORS.textMuted} />
          <Text style={styles.navText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const AddRecipientFlow = ({ onCancel, onSave }: { onCancel: () => void, onSave: (r: Recipient) => void }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [data, setData] = useState<Partial<Recipient>>({
    name: '',
    relationship: '',
    ageRange: '',
    gender: '',
    interests: [],
    dislikes: '',
    budget: '',
    pastGifts: '',
  });

  const updateData = (key: keyof Recipient, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  const toggleInterest = (interest: string) => {
    const current = data.interests || [];
    if (current.includes(interest)) {
      updateData('interests', current.filter(i => i !== interest));
    } else {
      updateData('interests', [...current, interest]);
    }
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else {
      const newRecipient: Recipient = {
        id: generateId(),
        name: data.name!,
        relationship: data.relationship || 'Friend',
        ageRange: data.ageRange || '18-30',
        gender: data.gender || 'Female',
        interests: data.interests || [],
        dislikes: data.dislikes || '',
        budget: data.budget || '$50',
        pastGifts: data.pastGifts || '',
        savedIdeas: []
      };
      onSave(newRecipient);
    }
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <FadeInView key="step1">
            <Text style={styles.stepTitle}>Who is this person?</Text>
            
            <Text style={styles.label}>Their name</Text>
            <TextInput 
              style={styles.input} 
              placeholder="e.g. Mom, Sarah"
              value={data.name}
              onChangeText={t => updateData('name', t)}
              autoFocus
            />

            <Text style={styles.label}>Your relationship</Text>
            <View style={styles.chipContainer}>
              {RELATIONSHIPS.map(rel => (
                <TouchableOpacity 
                  key={rel} 
                  style={[styles.chip, data.relationship === rel && styles.chipActive]}
                  onPress={() => updateData('relationship', rel)}
                >
                  <Text style={[styles.chipText, data.relationship === rel && styles.chipTextActive]}>{rel}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </FadeInView>
        );
      case 2:
        return (
          <FadeInView key="step2">
            <Text style={styles.stepTitle}>Tell us a bit more</Text>
            
            <Text style={styles.label}>Age range</Text>
            <View style={styles.chipContainer}>
              {AGE_RANGES.map(age => (
                <TouchableOpacity 
                  key={age} 
                  style={[styles.chip, data.ageRange === age && styles.chipActive]}
                  onPress={() => updateData('ageRange', age)}
                >
                  <Text style={[styles.chipText, data.ageRange === age && styles.chipTextActive]}>{age}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Gender (helps with ideas)</Text>
            <View style={styles.chipContainer}>
              {['Female', 'Male', 'Non-binary', 'Skip'].map(g => (
                <TouchableOpacity 
                  key={g} 
                  style={[styles.chip, data.gender === g && styles.chipActive]}
                  onPress={() => updateData('gender', g)}
                >
                  <Text style={[styles.chipText, data.gender === g && styles.chipTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </FadeInView>
        );
      case 3:
        return (
          <FadeInView key="step3">
            <Text style={styles.stepTitle}>What do they enjoy?</Text>
            <Text style={styles.stepSubtitle}>Select all that apply</Text>
            
            <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
              <View style={styles.chipContainer}>
                {INTERESTS_LIST.map(interest => (
                  <TouchableOpacity 
                    key={interest} 
                    style={[styles.chip, data.interests?.includes(interest) && styles.chipActive]}
                    onPress={() => toggleInterest(interest)}
                  >
                    <Text style={[styles.chipText, data.interests?.includes(interest) && styles.chipTextActive]}>{interest}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </FadeInView>
        );
      case 4:
        return (
          <FadeInView key="step4">
            <Text style={styles.stepTitle}>Anything to avoid?</Text>
            <Text style={styles.stepSubtitle}>Allergies, dislikes, or things they already have.</Text>
            
            <TextInput 
              style={[styles.input, { height: 120, paddingTop: 16 }]} 
              placeholder="e.g. Has enough candles, allergic to wool, doesn't drink coffee"
              multiline
              textAlignVertical="top"
              value={data.dislikes}
              onChangeText={t => updateData('dislikes', t)}
            />
          </FadeInView>
        );
      case 5:
        return (
          <FadeInView key="step5">
            <Text style={styles.stepTitle}>Almost done!</Text>
            
            <Text style={styles.label}>Typical budget for them</Text>
            <View style={styles.chipContainer}>
              {['$25', '$50', '$100', '$150', '$200+'].map(b => (
                <TouchableOpacity 
                  key={b} 
                  style={[styles.chip, data.budget === b && styles.chipActive]}
                  onPress={() => updateData('budget', b)}
                >
                  <Text style={[styles.chipText, data.budget === b && styles.chipTextActive]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Past gifts that worked (Optional)</Text>
            <TextInput 
              style={[styles.input, { height: 100, paddingTop: 16 }]} 
              placeholder="e.g. Loved the spa gift card"
              multiline
              textAlignVertical="top"
              value={data.pastGifts}
              onChangeText={t => updateData('pastGifts', t)}
            />
          </FadeInView>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={styles.flowHeader}>
          <TouchableOpacity onPress={step === 1 ? onCancel : () => setStep(step - 1)} style={styles.backButton}>
            {step === 1 ? <X size={24} color={COLORS.textPrimary} /> : <ChevronLeft size={24} color={COLORS.textPrimary} />}
          </TouchableOpacity>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%` }]} />
          </View>
          <Text style={styles.stepIndicator}>{step}/{totalSteps}</Text>
        </View>

        <View style={styles.flowContent}>
          {renderStepContent()}
        </View>

        <View style={styles.footer}>
          <Button 
            title={step === totalSteps ? "Save Person" : "Continue"} 
            onPress={handleNext} 
          />
          {step > 2 && step < totalSteps && (
            <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }} onPress={handleNext}>
              <Text style={{ color: COLORS.textSecondary, fontFamily: FONTS.body }}>Skip for now</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const RecipientDetailScreen = ({ 
  recipient, 
  onBack, 
  onFindGifts 
}: { 
  recipient: Recipient; 
  onBack: () => void;
  onFindGifts: () => void;
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.detailTitle}>{recipient.name}</Text>
        <TouchableOpacity style={styles.backButton}>
          <Text style={{ fontSize: 18 }}>✏️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.detailProfile}>
          <View style={[styles.largeAvatar, { backgroundColor: COLORS.accentSoft }]}>
            <Text style={{ fontSize: 40 }}>
              {recipient.gender === 'Female' ? '👩' : recipient.gender === 'Male' ? '👨' : '👤'}
            </Text>
          </View>
          <Text style={styles.detailName}>{recipient.name}</Text>
          <Text style={styles.detailMeta}>{recipient.relationship} • {recipient.ageRange}</Text>
        </View>

        <View style={styles.sectionContainer}>
          <Card style={styles.occasionCard}>
            <View>
              <Text style={styles.occasionTitle}>🎄 Christmas</Text>
              <Text style={styles.occasionDate}>in 23 days</Text>
            </View>
            <Button 
              title="Find Gift Ideas" 
              onPress={onFindGifts} 
              icon={<Sparkles size={16} color={COLORS.white} />}
              style={{ paddingVertical: 12, paddingHorizontal: 16, marginTop: 16 }}
            />
          </Card>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Interests</Text>
          <View style={styles.chipContainer}>
            {recipient.interests.length > 0 ? (
              recipient.interests.map(i => (
                <View key={i} style={styles.displayChip}>
                  <Text style={styles.displayChipText}>{i}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No interests added yet</Text>
            )}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Budget</Text>
          <Text style={styles.bodyText}>Usually around {recipient.budget}</Text>
        </View>

        <View style={styles.sectionContainer}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
            <Text style={styles.sectionTitle}>Saved Ideas</Text>
            <Text style={styles.countBadge}>{recipient.savedIdeas.length}</Text>
          </View>
          
          {recipient.savedIdeas.length === 0 ? (
            <View style={styles.emptyStateSimple}>
              <Heart size={24} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No saved ideas yet</Text>
            </View>
          ) : (
            recipient.savedIdeas.map(idea => (
              <Card key={idea.id} style={{ marginBottom: 12 }}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <View style={{flex: 1}}>
                    <Text style={styles.giftName}>{idea.name}</Text>
                    <Text style={styles.giftPrice}>{idea.price}</Text>
                  </View>
                  <TouchableOpacity style={styles.actionIcon}>
                    <Heart size={20} color={COLORS.accentPrimary} fill={COLORS.accentPrimary} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const GiftIdeasScreen = ({ recipient, onBack }: { recipient: Recipient, onBack: () => void }) => {
  const [loading, setLoading] = useState(true);
  const [ideas, setIdeas] = useState<GiftIdea[]>([]);

  useEffect(() => {
    // Simulate AI Loading
    const timer = setTimeout(() => {
      setLoading(false);
      setIdeas(MOCK_GIFT_IDEAS);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const toggleSave = (id: string) => {
    setIdeas(prev => prev.map(idea => 
      idea.id === id ? { ...idea, isSaved: !idea.isSaved } : idea
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Ideas for {recipient.name}</Text>
          <Text style={styles.headerSubtitle}>Budget: {recipient.budget}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <FadeInView>
            <View style={styles.loadingIcon}>
              <Sparkles size={48} color={COLORS.accentPrimary} />
            </View>
            <Text style={styles.loadingText}>Finding perfect gifts...</Text>
            <Text style={styles.loadingSubtext}>Analyzing interests and preferences</Text>
          </FadeInView>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}>
          <Text style={styles.resultsCount}>We found {ideas.length} ideas for {recipient.name}</Text>
          
          {ideas.map((idea, index) => (
            <FadeInView key={idea.id} delay={index * 100} style={{ marginBottom: 16 }}>
              <Card>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.giftName}>{idea.name}</Text>
                    <Text style={styles.giftDescription}>{idea.description}</Text>
                  </View>
                  <Text style={styles.giftPrice}>{idea.price}</Text>
                </View>
                
                <View style={styles.reasoningContainer}>
                  <Sparkles size={14} color={COLORS.accentSecondary} style={{ marginRight: 6, marginTop: 2 }} />
                  <Text style={styles.giftReasoning}>{idea.reasoning}</Text>
                </View>

                <View style={styles.giftActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, idea.isSaved && styles.actionButtonActive]}
                    onPress={() => toggleSave(idea.id)}
                  >
                    <Heart 
                      size={20} 
                      color={idea.isSaved ? COLORS.accentPrimary : COLORS.textSecondary} 
                      fill={idea.isSaved ? COLORS.accentPrimary : 'transparent'}
                    />
                  </TouchableOpacity>
                  <Button 
                    title="View Online" 
                    variant="outline" 
                    onPress={() => {}} 
                    style={{ height: 40, paddingVertical: 0, paddingHorizontal: 16, marginLeft: 'auto' }}
                  />
                </View>
              </Card>
            </FadeInView>
          ))}

          <Button 
            title="More Ideas" 
            variant="ghost" 
            onPress={() => {}} 
            icon={<Sparkles size={18} color={COLORS.textSecondary} />}
            style={{ marginTop: 8 }}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [screen, setScreen] = useState<'splash' | 'onboarding' | 'home' | 'addRecipient' | 'detail' | 'ideas'>('splash');
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);

  const handleAddRecipient = (newRecipient: Recipient) => {
    setRecipients([...recipients, newRecipient]);
    setScreen('home');
  };

  const handleSelectRecipient = (recipient: Recipient) => {
    setSelectedRecipient(recipient);
    setScreen('detail');
  };

  const handleFindGifts = () => {
    setScreen('ideas');
  };

  const renderScreen = () => {
    switch(screen) {
      case 'splash':
        return <SplashScreen onFinish={() => setScreen('onboarding')} />;
      case 'onboarding':
        return <OnboardingScreen onFinish={() => setScreen('home')} />;
      case 'home':
        return (
          <HomeScreen 
            recipients={recipients} 
            onAddRecipient={() => setScreen('addRecipient')}
            onSelectRecipient={handleSelectRecipient}
          />
        );
      case 'addRecipient':
        return (
          <AddRecipientFlow 
            onCancel={() => setScreen('home')} 
            onSave={handleAddRecipient}
          />
        );
      case 'detail':
        return selectedRecipient ? (
          <RecipientDetailScreen 
            recipient={selectedRecipient} 
            onBack={() => setScreen('home')}
            onFindGifts={handleFindGifts}
          />
        ) : null;
      case 'ideas':
        return selectedRecipient ? (
          <GiftIdeasScreen 
            recipient={selectedRecipient}
            onBack={() => setScreen('detail')}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <View style={styles.appContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />
      {renderScreen()}
    </View>
  );
}

// --- STYLES ---

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  // Splash
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgPrimary,
  },
  splashIconContainer: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  splashTitle: {
    fontSize: 40,
    fontFamily: FONTS.display,
    fontWeight: '800',
    color: COLORS.accentPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  splashTagline: {
    fontSize: 18,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  // Onboarding
  onboardingContent: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onboardingIllustration: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingTitle: {
    fontSize: 28,
    fontFamily: FONTS.display,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  onboardingSubtitle: {
    fontSize: 16,
    fontFamily: FONTS.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    marginTop: SPACING.xl,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.accentPrimary,
    width: 24,
  },
  footer: {
    padding: SPACING.xl,
    paddingBottom: Platform.OS === 'ios' ? 0 : SPACING.xl,
  },
  // Button
  button: {
    borderRadius: RADIUS.full,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: FONTS.display,
  },
  // Card
  card: {
    backgroundColor: COLORS.bgSecondary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.bgSubtle,
  },
  // Home
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  greeting: {
    fontSize: 24,
    fontFamily: FONTS.display,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subGreeting: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accentPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.xl,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  searchPlaceholder: {
    marginLeft: SPACING.sm,
    color: COLORS.textMuted,
    fontSize: 16,
  },
  sectionHeader: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: FONTS.display,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.xl,
    gap: SPACING.md,
  },
  recipientCard: {
    width: (SCREEN_WIDTH - 48 - 12) / 2,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  addRecipientCard: {
    borderStyle: 'dashed',
    borderColor: COLORS.textMuted,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    height: 140,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  recipientRelation: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  occasionBadge: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  occasionText: {
    fontSize: 10,
    color: COLORS.accentPrimary,
    fontWeight: '600',
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.bgSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  emptyStateText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  emptyUpcoming: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    backgroundColor: COLORS.bgSubtle,
    marginHorizontal: SPACING.xl,
    borderRadius: RADIUS.lg,
  },
  findGiftButton: {
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  findGiftText: {
    color: COLORS.accentPrimary,
    fontWeight: '600',
    fontSize: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 10,
    marginTop: 4,
    color: COLORS.textMuted,
  },
  // Add Recipient Flow
  flowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.bgSubtle,
  },
  backButton: {
    padding: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.bgSubtle,
    marginHorizontal: SPACING.lg,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accentPrimary,
    borderRadius: 2,
  },
  stepIndicator: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  flowContent: {
    flex: 1,
    padding: SPACING.xl,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    fontFamily: FONTS.display,
  },
  stepSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.bgSubtle,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: COLORS.accentSoft,
    borderColor: COLORS.accentPrimary,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  chipTextActive: {
    color: COLORS.accentPrimary,
    fontWeight: '600',
  },
  // Recipient Detail
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  detailProfile: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  detailName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  detailMeta: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  sectionContainer: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  occasionCard: {
    backgroundColor: COLORS.bgSecondary,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accentPrimary,
  },
  occasionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  occasionDate: {
    fontSize: 14,
    color: COLORS.accentPrimary,
    fontWeight: '600',
    marginTop: 4,
  },
  displayChip: {
    backgroundColor: COLORS.accentSoft,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    marginRight: 8,
    marginBottom: 8,
  },
  displayChipText: {
    color: COLORS.accentPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  bodyText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  countBadge: {
    backgroundColor: COLORS.bgSubtle,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    fontSize: 12,
    color: COLORS.textSecondary,
    overflow: 'hidden',
  },
  emptyStateSimple: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.bgSubtle,
    borderRadius: RADIUS.lg,
  },
  emptyText: {
    color: COLORS.textMuted,
    marginTop: 8,
  },
  // Gift Ideas
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  loadingIcon: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  loadingSubtext: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  resultsCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  giftName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  giftDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  giftPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  reasoningContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgSubtle,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  giftReasoning: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  giftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonActive: {
    backgroundColor: COLORS.accentSoft,
  },
  actionIcon: {
    padding: 8,
  }
});
