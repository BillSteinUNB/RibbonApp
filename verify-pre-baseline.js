#!/usr/bin/env node

/**
 * Verification script for pre-baseline commit identification
 * This script verifies that the pre-baseline commit hash has been correctly identified
 */

const { execSync } = require('child_process');

try {
  // Get the commit hash that's been identified as the pre-baseline commit
  const preBaselineCommit = '7ef03c2';
  
  // Verify this commit exists in the git history
  const output = execSync(`git show ${preBaselineCommit} --format="%H %s" --no-patch`, { encoding: 'utf-8' });
  
  console.log('✓ Pre-baseline commit identified successfully:');
  console.log(`  Hash: ${preBaselineCommit}`);
  console.log(`  Details: ${output.trim()}`);
  
  // Verify this is the commit before the Expo reset
  const logOutput = execSync('git log --oneline | head -5', { encoding: 'utf-8' });
  const recentCommits = logOutput.trim().split('\n');
  
  console.log('\n✓ Recent commit history verification:');
  console.log(`  Current HEAD: ${recentCommits[0]}`);
  console.log(`  Expo reset commit: ${recentCommits[1]}`);
  console.log(`  Pre-baseline commit: ${recentCommits[2]}`);
  
  const expoResetHash = recentCommits[1].split(' ')[0];
  const preBaselineHash = recentCommits[2].split(' ')[0];
  
  if (preBaselineHash === preBaselineCommit) {
    console.log('\n✓ SUCCESS: Pre-baseline commit hash correctly identified as', preBaselineCommit);
    process.exit(0);
  } else {
    console.log('\n✗ FAILURE: Pre-baseline commit hash mismatch');
    console.log(`  Expected: ${preBaselineCommit}`);
    console.log(`  Found: ${preBaselineHash}`);
    process.exit(1);
  }
} catch (error) {
  console.error('✗ ERROR:', error.message);
  process.exit(1);
}
