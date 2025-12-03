import { Deploy } from 'cordova-plugin-ionic/dist/ngx';
import { Capacitor } from '@capacitor/core';

/**
 * Ionic Appflow Deploy - Live Updates
 * Checks for and downloads app updates without App Store review
 */

let deployInstance: Deploy | null = null;

export async function initializeDeploy() {
  // Only initialize on native platforms
  if (!Capacitor.isNativePlatform()) {
    console.log('[Deploy] Skipping - running in web browser');
    return;
  }

  try {
    deployInstance = new Deploy();

    console.log('[Deploy] Initializing...');
    await deployInstance.configure({
      appId: '76606737',
      channel: 'Production',
    });

    // Check for updates on app launch
    await checkForUpdate();

    console.log('[Deploy] Initialized successfully');
  } catch (error) {
    console.error('[Deploy] Initialization error:', error);
  }
}

export async function checkForUpdate() {
  if (!deployInstance) {
    console.log('[Deploy] Not initialized');
    return;
  }

  try {
    console.log('[Deploy] Checking for updates...');

    const update = await deployInstance.checkForUpdate();

    if (update.available) {
      console.log('[Deploy] Update available!', update);

      // Download the update
      await deployInstance.downloadUpdate((progress) => {
        console.log(`[Deploy] Downloading: ${progress}%`);
      });

      console.log('[Deploy] Update downloaded, extracting...');
      await deployInstance.extractUpdate();

      console.log('[Deploy] Update ready, will reload on next launch');

      // Reload the app to apply update
      await deployInstance.reloadApp();
    } else {
      console.log('[Deploy] App is up to date');
    }
  } catch (error) {
    console.error('[Deploy] Update check error:', error);
  }
}

export async function syncNow() {
  if (!deployInstance) {
    console.log('[Deploy] Not initialized');
    return;
  }

  try {
    console.log('[Deploy] Syncing now...');
    await deployInstance.sync({ updateMethod: 'auto' });
    console.log('[Deploy] Sync complete');
  } catch (error) {
    console.error('[Deploy] Sync error:', error);
  }
}

export async function getCurrentVersion() {
  if (!deployInstance) {
    return null;
  }

  try {
    const snapshot = await deployInstance.getCurrentVersion();
    return snapshot;
  } catch (error) {
    console.error('[Deploy] Error getting version:', error);
    return null;
  }
}
