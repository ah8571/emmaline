import { existsSync } from 'fs';

const parseServiceAccountCredentials = (rawValue) => {
  if (!rawValue) {
    return null;
  }

  const trimmedValue = String(rawValue).trim();
  if (!trimmedValue) {
    return null;
  }

  const candidateValues = [trimmedValue];

  try {
    candidateValues.push(Buffer.from(trimmedValue, 'base64').toString('utf8'));
  } catch {
    // Ignore base64 decode failures and fall back to plain JSON parsing.
  }

  for (const candidate of candidateValues) {
    try {
      const parsed = JSON.parse(candidate);

      if (parsed?.private_key) {
        parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
      }

      if (parsed?.client_email && parsed?.private_key) {
        return parsed;
      }
    } catch {
      // Ignore invalid JSON candidates.
    }
  }

  return null;
};

export const getGoogleCloudClientOptions = () => {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || undefined;
  const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS || undefined;
  const credentials = parseServiceAccountCredentials(
    process.env.GOOGLE_CLOUD_CREDENTIALS_JSON || process.env.GOOGLE_CLOUD_CREDENTIALS
  );

  if (credentials) {
    return {
      projectId,
      credentials
    };
  }

  if (keyFilename) {
    return {
      projectId,
      keyFilename
    };
  }

  if (projectId) {
    return { projectId };
  }

  return {};
};

export const hasGoogleCloudCredentials = () => {
  const inlineCredentials = parseServiceAccountCredentials(
    process.env.GOOGLE_CLOUD_CREDENTIALS_JSON || process.env.GOOGLE_CLOUD_CREDENTIALS
  );

  if (inlineCredentials) {
    return true;
  }

  const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyFilename && existsSync(keyFilename)) {
    return true;
  }

  return false;
};

export const getGoogleCloudConfigStatus = () => {
  return {
    hasProjectId: Boolean(process.env.GOOGLE_CLOUD_PROJECT_ID),
    hasCredentials: hasGoogleCloudCredentials()
  };
};
