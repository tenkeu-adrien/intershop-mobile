import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { sendEmailVerification } from 'firebase/auth';

export const sendVerificationCode = async (userId: string, email: string): Promise<string> => {
  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 4); // 4 minutes expiry
  
  // Save to Firestore
  await setDoc(doc(db, 'emailVerifications', userId), {
    userId,
    email,
    code,
    createdAt: new Date(),
    expiresAt,
    attempts: 0,
    verified: false,
  });
  
  // TODO: Send email with code (integrate with email service)
  console.log(`Verification code for ${email}: ${code}`);
  
  return code;
};

export const verifyCode = async (userId: string, code: string): Promise<boolean> => {
  const verificationDoc = await getDoc(doc(db, 'emailVerifications', userId));
  
  if (!verificationDoc.exists()) {
    throw new Error('Code de vérification non trouvé');
  }
  
  const data = verificationDoc.data();
  
  // Check expiry
  if (new Date() > data.expiresAt.toDate()) {
    throw new Error('Code expiré');
  }
  
  // Check attempts
  if (data.attempts >= 3) {
    throw new Error('Trop de tentatives. Demandez un nouveau code.');
  }
  
  // Verify code
  if (data.code !== code) {
    await updateDoc(doc(db, 'emailVerifications', userId), {
      attempts: data.attempts + 1,
    });
    throw new Error('Code incorrect');
  }
  
  // Mark as verified
  await updateDoc(doc(db, 'emailVerifications', userId), {
    verified: true,
    verifiedAt: new Date(),
  });
  
  // Update user
  await updateDoc(doc(db, 'users', userId), {
    emailVerified: true,
    accountStatus: 'phone_unverified',
    updatedAt: new Date(),
  });
  
  return true;
};

export const sendPhoneVerificationCode = async (phoneNumber: string): Promise<void> => {
  // TODO: Integrate with SMS service (Twilio, Firebase Phone Auth, etc.)
  console.log(`SMS verification code sent to ${phoneNumber}`);
};

export const verifyPhoneCode = async (userId: string, code: string): Promise<boolean> => {
  // TODO: Verify phone code
  // For now, update user status
  await updateDoc(doc(db, 'users', userId), {
    phoneVerified: true,
    accountStatus: 'pending_admin_approval',
    updatedAt: new Date(),
  });
  
  return true;
};
