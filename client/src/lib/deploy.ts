import { Capacitor } from '@capacitor/core';

/**
 * Ionic Appflow Deploy - Live Updates
 * Checks for and downloads app updates without App Store review
 */

// Use Capacitor plugin interface instead of Angular wrapper
declare const IonicDeploy: any;

export async function initializeDeploy() {
  // Only initialize on native platforms
  if (!Capacitor.isNativePlatform()) {
    console.log('[Deploy] Skipping - running in web browser');
    return;
  }

  // Deploy plugin is auto-configured via capacitor.config.ts and Info.plist
  // Just check for updates on launch
  try {
    console.log('[Deploy] Checking for updates...');
    await checkForUpdate();
  } catch (error) {
    console.error('[Deploy] Initialization error:', error);
  }
}

export async function checkForUpdate() {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    if (typeof IonicDeploy === 'undefined') {
      console.log('[Deploy] Plugin not available');
      return;
    }

    const update = await IonicDeploy.checkForUpdate();

    if (update.available) {
      console.log('[Deploy] Update available!', update);

      // Download the update
      await IonicDeploy.downloadUpdate((progress: number) => {
        console.log(`[Deploy] Downloading: ${progress}%`);
      });

      console.log('[Deploy] Update downloaded, extracting...');
      await IonicDeploy.extractUpdate();

      console.log('[Deploy] Update ready, will reload on next launch');

      // Reload the app to apply update
      await IonicDeploy.reloadApp();
    } else {
      console.log('[Deploy] App is up to date');
    }
  } catch (error) {
    console.error('[Deploy] Update check error:', error);
  }
}

export async function syncNow() {
  if (!Capacitor.isNativePlatform() || typeof IonicDeploy === 'undefined') {
    return;
  }

  try {
    console.log('[Deploy] Syncing now...');
    await IonicDeploy.sync({ updateMethod: 'auto' });
    console.log('[Deploy] Sync complete');
  } catch (error) {
    console.error('[Deploy] Sync error:', error);
  }
}

export async function getCurrentVersion() {
  if (!Capacitor.isNativePlatform() || typeof IonicDeploy === 'undefined') {
    return null;
  }

  try {
    const snapshot = await IonicDeploy.getCurrentVersion();
    return snapshot;
  } catch (error) {
    console.error('[Deploy] Error getting version:', error);
    return null;
  }
}
