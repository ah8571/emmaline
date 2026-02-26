# GDPR Compliance Guide for Emmaline

This document outlines GDPR compliance requirements and implementation for Emmaline. GDPR is mandatory for any EU users, even if you're not based in the EU.

## Table of Contents

1. [Core GDPR Obligations](#core-gdpr-obligations)
2. [Practical Implementation](#practical-implementation)
3. [Data Processing Agreements](#data-processing-agreements)
4. [User Rights](#user-rights)
5. [Privacy Policy Template](#privacy-policy-template)
6. [Risk Assessment](#risk-assessment)
7. [Implementation Checklist](#implementation-checklist)

---

## Core GDPR Obligations

### 1. Data Collection Consent

Users must explicitly opt-in before you collect their data.

**What you need:**
```
Before first call:
❌ DON'T just let them call
✅ DO show: "We record audio, transcribe with Google Cloud, summarize with OpenAI"
✅ DO get explicit consent checkbox
✅ DO explain data retention (e.g., "Kept for 30 days, then auto-deleted")
```

**Mobile App Implementation:**
- Add consent screen before first login
- Clear explanation of data flow
- Explicit checkbox user must accept
- Link to Privacy Policy
- Option to review before accepting

### 2. Privacy Policy

Required document explaining:
- What data you collect (audio, transcripts, user email)
- How long you keep it (retention period)
- Who accesses it (Google Cloud, OpenAI, your team)
- User rights (see User Rights section)
- How to exercise those rights

**Must be:**
- Easily accessible (link in app footer and website)
- Written in plain language (avoid legal jargon)
- Specific about third-party processors
- Updated when practices change

### 3. User Rights (GDPR Rights)

You must implement technical access to:

#### Right to Access
- Users can download/view their data
- Provide in machine-readable format (JSON)
- Include all calls, transcripts, notes, metadata

**Implementation:**
```
Settings → "Download My Data"
→ Exports ZIP with all user data
→ Available within 30 days of request
```

#### Right to Deletion
- Users can delete conversations
- Users can request full account deletion
- Data removed within 30 days (soft delete)
- Auto-purge from backups within 90 days

**Implementation:**
```
Per-call: Delete button on each transcript
Full account: Settings → "Delete Account"
→ Confirmation dialog
→ Complete removal within 7 days
```

#### Right to Portability
- User can export all data in portable format
- Can take data to competitor
- Include all calls, notes, metadata

**Implementation:**
```
Settings → "Export All Data"
→ JSON/CSV format
→ Can import to other services
```

#### Right to Correction
- Users can correct/update their data
- Note: Can't edit audio/transcripts (immutable)
- Can edit notes and metadata

**Implementation:**
```
Existing: Notes editing ✅
Edit profile: User can update email/name
```

### 4. Data Processing Agreements (DPA)

Since you use third parties, you need agreements with them:

#### Google Cloud Speech-to-Text
- ✅ Has standard DPA (sign their Data Processing Agreement)
- Users' audio streamed to Google's servers
- EU option: Request EU data centers (available in Console)

#### OpenAI
- ⚠️ **Important:** OpenAI uses data for model improvement
- Solution: Requires Business tier + explicit contract to opt-out
- Currently no EU data center option
- Check latest terms as this changes

**Code to use OpenAI safely:**
```javascript
// Requires Business tier subscription
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [...],
  organization: process.env.OPENAI_ORG_ID
  // Note: Still requires contractual agreement
  // Regular tier: Your data CAN be used for training
});

// Until Business tier: Inform users in Privacy Policy
// "Your transcripts may be used by OpenAI to improve their services"
```

#### Supabase
- ✅ Has DPA (included in their terms)
- Data stored encrypted in your chosen region
- Can select EU region to keep data in EU

**Supabase DPA:**
- Access: https://supabase.com/terms
- Use EU region: `eu-west-1` (Ireland)

### 5. Data Breach Notification

If you experience a security incident:
- Notify EU authorities within **72 hours**
- Notify affected users **without undue delay**
- Document the incident and your response

**Reporting process:**
1. Identify the breach
2. Assess impact on user data
3. Contact your data protection authority (DPA)
4. Email users affected with details

### 6. Lawful Basis for Processing

You need a legal reason to process data. Options:

```
Consent (✅ BEST FOR EMMALINE)
├─ User explicitly agrees upfront
├─ Can withdraw consent anytime
├─ Easiest to implement
└─ Clear audit trail of agreement

Contractual Necessity
├─ Required to provide the service
└─ Apply AFTER consent given

Legitimate Interest
├─ Your business needs it
├─ Must balance against user privacy
└─ Harder to justify for EU regulators

Legal Obligation
├─ Law requires you to keep data
└─ Rare for this use case
```

**For Emmaline: Use Consent** - Users agree upfront to all processing.

---

## Practical Implementation

### Before Launch

**Legal Documents:**
- [ ] Write Privacy Policy (see template below)
- [ ] Create Terms of Service (use template from GitHub)
- [ ] Document your Data Retention Policy
- [ ] Document your Security Measures

**Third-Party Agreements:**
- [ ] Get DPA signed with Supabase
- [ ] Get DPA signed with Google Cloud
- [ ] Get DPA signed with OpenAI (requires Business tier)
- [ ] Review terms of all external services

**Mobile App Features:**
- [ ] Add consent screen before first login
- [ ] Test data deletion (works end-to-end)
- [ ] Add Settings screen with:
  - [ ] Download My Data button
  - [ ] Delete Account button
  - [ ] Link to Privacy Policy
- [ ] Add Privacy Policy acceptance checkbox

**Backend API Endpoints:**
```javascript
// GET /api/user/data - Export all user data
// DELETE /api/user - Delete all user data (soft delete)
// POST /api/user/export - Create export job (async)
```

### Mobile App Code Structure

#### 1. Consent Screen (Show Before LoginScreen)

```javascript
// screens/ConsentScreen.js
export const ConsentScreen = ({ onAccept }) => {
  const [agreedToConsent, setAgreedToConsent] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Data & Privacy Notice</Text>

        <Text style={styles.section}>By using Emmaline, you agree to:</Text>

        <Text style={styles.text}>
          • Audio recording of all calls
          • Transcription via Google Cloud Speech-to-Text
          • Summarization via OpenAI
          • Storage in our encrypted database
          • 30-day automatic deletion of old calls
        </Text>

        <Pressable onPress={() => Linking.openURL('/privacy-policy')}>
          <Text style={styles.link}>Read our full Privacy Policy</Text>
        </Pressable>

        <View style={styles.checkboxContainer}>
          <Checkbox
            value={agreedToConsent}
            onValueChange={setAgreedToConsent}
          />
          <Text>I understand and agree to the above</Text>
        </View>

        <Button
          title="I Agree"
          disabled={!agreedToConsent}
          onPress={onAccept}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
```

#### 2. Settings Screen with Privacy Controls

```javascript
// screens/SettingsScreen.js
export const SettingsScreen = ({ user, navigation }) => {
  const [loading, setLoading] = useState(false);

  const handleDownloadData = async () => {
    setLoading(true);
    try {
      const result = await api.getUserData();
      // Save/share the JSON file
      shareFile(JSON.stringify(result, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account?',
      'This will permanently delete your account and all data. This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await api.deleteAccount();
              navigation.replace('Login');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleViewPrivacyPolicy = () => {
    navigation.navigate('WebView', {
      url: 'https://yourdomain.com/privacy-policy'
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.section}>Privacy & Data</Text>

      <Button
        title="Download My Data"
        onPress={handleDownloadData}
        loading={loading}
      />
      <Text style={styles.help}>
        Get a copy of all your calls, notes, and account data
      </Text>

      <Button
        title="Delete Account"
        color="#dc3545"
        onPress={handleDeleteAccount}
        loading={loading}
      />
      <Text style={styles.help}>
        Permanently delete your account (cannot be undone)
      </Text>

      <Divider />

      <Pressable onPress={handleViewPrivacyPolicy}>
        <Text style={styles.link}>Privacy Policy</Text>
      </Pressable>

      <Pressable onPress={() => Linking.openURL('mailto:privacy@yourdomain.com')}>
        <Text style={styles.link}>Contact Privacy Team</Text>
      </Pressable>

      <Text style={styles.smallText}>
        Version: {APP_VERSION}
      </Text>
    </ScrollView>
  );
};
```

#### 3. Backend Endpoints

```javascript
// routes/user.js
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/user/data
 * Export all user data in machine-readable format
 */
router.get('/data', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch all user data
    const user = await getUserById(userId);
    const calls = await getCallsForUser(userId);
    const notes = await getNotesForUser(userId);

    const userData = {
      user: user,
      calls: calls,
      notes: notes,
      exportedAt: new Date().toISOString(),
      exportFormat: 'json-v1'
    };

    res.json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Error exporting user data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

/**
 * DELETE /api/user
 * Delete user account and all associated data
 */
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { password } = req.body;

    // Verify password before deletion
    const user = await getUserById(userId);
    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Soft delete user account
    await deleteUser(userId);

    // Queue hard delete in 90 days
    scheduleHardDelete(userId, 90);

    res.json({
      success: true,
      message: 'Account scheduled for deletion'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
```

### Integration in AppNavigator

```javascript
// Show consent before login
const AppNavigator = () => {
  const [consentGiven, setConsentGiven] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);

  if (!consentGiven) {
    return (
      <ConsentScreen
        onAccept={() => {
          setConsentGiven(true);
          // Save consent to secure storage
          SecureStorage.saveConsent(true);
        }}
      />
    );
  }

  if (!isSignedIn) {
    return <LoginStack />;
  }

  return <AppTabs />;
};
```

---

## Privacy Policy Template

```markdown
# Privacy Policy for Emmaline

**Last Updated:** [DATE]
**Effective Date:** [DATE]

## 1. Introduction

Emmaline ("we," "us," "our") provides an AI phone call assistant service. 
This Privacy Policy explains how we collect, use, disclose, and safeguard 
your information.

Please read this Privacy Policy carefully. If you do not agree with our 
policies and practices, please do not use our Service.

## 2. What Information We Collect

### Information You Provide:
- **Account Information:** Email address, password (hashed)
- **Call Data:** Audio recordings of all conversations
- **Transcripts:** Text transcriptions generated from audio
- **Notes:** Any notes you create about calls
- **Metadata:** Call timestamps, duration, phone number

### Information Collected Automatically:
- **Device Information:** Device type, operating system
- **Usage Information:** Features used, call frequency, app performance
- **Technical Information:** IP address, crash logs, error reports

## 3. How We Use Your Information

- Provide transcription services (Google Cloud Speech-to-Text)
- Generate summaries and insights (OpenAI)
- Store and retrieve your calls and notes
- Send you support responses (if requested)
- Improve our service reliability
- Comply with legal obligations

## 4. Data Sharing & Third Parties

Your data is processed by:

| Service | Purpose | Data Shared | Privacy |
|---------|---------|------------|---------|
| Google Cloud | Speech-to-Text | Audio (encrypted) | [Privacy Policy](https://cloud.google.com/privacy) |
| OpenAI | Summarization | Transcripts | [Privacy Policy](https://openai.com/privacy) |
| Supabase | Storage | Encrypted data | [Privacy Policy](https://supabase.com/privacy) |

**Important:** 
- OpenAI may use data to improve their services (unless you have Business tier)
- All data is encrypted in transit and at rest
- We do NOT sell your data to third parties

## 5. Data Retention

- **Active Calls:** Stored indefinitely until you delete
- **Deleted Calls:** Soft-deleted immediately, hard-deleted after 90 days
- **Account Deletion:** All data removed within 7 days
- **Backups:** Retained for 90 days for disaster recovery

## 6. Your Privacy Rights (GDPR)

You have the right to:

### Right to Access
Download a copy of your data anytime in the app:
- Settings → "Download My Data"
- Includes all calls, notes, metadata

### Right to Deletion
Delete your data:
- Per-call: Tap any transcript → Delete
- Full account: Settings → "Delete Account"
- Processed within 7 days

### Right to Portability
Export your data to another service:
- Settings → "Export All Data"
- JSON format, importable elsewhere

### Right to Correction
Update your information:
- Edit your profile in Settings
- Edit notes and metadata
- Audio/transcripts are immutable for integrity

### Right to Withdraw Consent
Stop using Emmaline anytime:
- Delete your account
- All data removed per retention policy

## 7. Data Security

We implement:
- SSL/TLS encryption for data in transit
- AES-256 encryption for data at rest (Supabase)
- HTTPS for all API communication
- Regular security updates
- Secure password hashing (bcryptjs)

However, no security is 100% secure. We cannot guarantee 
absolute protection against all attacks.

## 8. International Data Transfer

Your data may be processed in the United States by Google Cloud 
and OpenAI. By using Emmaline, you consent to this transfer.

For EU users: We comply with standard contractual clauses 
(SCCs) as approved by EU authorities.

## 9. Data Breach Notification

In case of a security incident:
- EU authorities notified within 72 hours
- Affected users notified without undue delay
- Details of breach and protective measures provided
- Contact: privacy@yourdomain.com

## 10. Contact Us

**Data Protection & Privacy Questions:**
- Email: privacy@yourdomain.com
- Response time: Within 14 days

**EU Data Protection Authority:**
- Your country's DPA: [Find yours](https://edpb.ec.europa.eu/about-edpb/about-edpb_en)

## 11. Changes to This Policy

We may update this Privacy Policy. Material changes will be 
communicated via the app or email. Continued use means you 
accept changes.

## 12. Lawful Basis for Processing

We process your data based on:
- **Your Consent** - You explicitly agree when using the service
- **Contract** - Necessary to provide the service
- **Legal Obligation** - Required by law

---

*This Privacy Policy complies with GDPR (EU), CCPA (California), 
and similar regulations.*
```

---

## Risk Assessment

### If You Ignore GDPR

**Legal Risks:**
- 🚨 Up to €20 million fine OR 4% global revenue (whichever is higher)
- 🚨 Even as indie dev with just 1 EU user
- 🚨 Individual team members can be held liable

**Practical Reality:**
- EU regulators prioritize large companies
- But enforcement is increasing year-over-year
- Small companies are targeted when they get traction

### If You Implement Correctly

**Benefits:**
- ✅ €0 legal risk
- ✅ Builds user trust ("We care about privacy")
- ✅ Competitive advantage vs. sloppy competitors
- ✅ Easy to add now (hard to retrofit later)
- ✅ Shows professionalism to investors

**Cost of Compliance:**
- Privacy Policy template: Free-$500
- Legal review: $500-2,000 (optional but recommended)
- Implementation time: 2-4 hours
- Maintenance: Minimal ongoing

---

## Implementation Checklist

### Phase 0: Before Launch
- [ ] Write Privacy Policy (use template above)
- [ ] Add consent screen to app
- [ ] Sign Supabase DPA
- [ ] Sign Google Cloud DPA
- [ ] Decide: OpenAI Business tier? (recommended)
- [ ] Add Settings screen
- [ ] Test: Delete account → Verify full removal

### Phase 1: Post-Launch
- [ ] Monitor for any compliance issues
- [ ] Set up privacy email (privacy@domain.com)
- [ ] Document data processing activities
- [ ] Create incident response plan

### Phase 2: Scale
- [ ] Consult lawyer ($500-2k) to review policy
- [ ] Implement Data Protection Impact Assessment (DPIA)
- [ ] Add more granular consent options (Phase 2+)
- [ ] Regular security audits

---

## Quick Reference

| Requirement | Why | How | Timeline |
|------------|-----|-----|----------|
| Consent | Legal basis | Checkbox before login | Before launch |
| Privacy Policy | Legal requirement | Written policy document | Before launch |
| User Deletion | GDPR right | Delete button in app | Before launch |
| Data Export | GDPR right | "Download my data" feature | Before launch |
| DPA with vendors | Legal requirement | Sign Google/Supabase DPA | Before launch |
| Breach notification | GDPR requirement | Process & contact info | Before launch |

---

## Resources

- [GDPR Official Text](https://gdpr-info.eu/)
- [ICO Guide to GDPR](https://ico.org.uk/for-organisations/guide-to-data-protection/guide-to-the-general-data-protection-regulation-gdpr/)
- [EDPB Guidelines](https://edpb.ec.europa.eu/)
- [Privacy Shield (now invalid, use SCCs)](https://www.privacyshield.gov/)
- [Standard Contractual Clauses](https://ec.europa.eu/info/law/law-topic/data-protection_en)

---

## Final Notes

**You're actually in a good position because:**
- ✅ You're transparent about data flows
- ✅ Users control their data (can delete)
- ✅ No tracking/analytics (privacy-first)
- ✅ Focused dataset (easy to manage)
- ✅ Good third-party partners (Google, OpenAI, Supabase)

**This contrasts with social media companies that:**
- ❌ Hide third-party data sharing
- ❌ Use data for advertising
- ❌ Make deletion impossible
- ❌ Collect millions of data points

**You can market this as a privacy-first alternative.** ✨
