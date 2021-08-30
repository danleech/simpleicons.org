#!/usr/bin/env node
/**
 * @fileoverview
 * Updates the version of this package to the CLI specified version.
 */

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..", "..");
const packageJsonFile = path.resolve(rootDir, "package.json");
const packageLockFile = path.resolve(rootDir, "package-lock.json");

function readManifest(file) {
  const manifestRaw = fs.readFileSync(file).toString();
  const manifestJson = JSON.parse(manifestRaw);
  return manifestJson;
}

function writeManifest(file, json) {
  const manifestRaw = JSON.stringify(json, null, 2) + "\n";
  fs.writeFileSync(file, manifestRaw);
}

function main(newVersion) {
  try {
    const manifest = readManifest(packageJsonFile);
    const manifestLock = readManifest(packageLockFile);

    manifest.version = newVersion
    manifestLock.version = newVersion

    writeManifest(packageJsonFile, manifest);
    writeManifest(packageLockFile, manifestLock);
  } catch (error) {
    console.error(`Failed to bump package version to ${newVersion}:`, error);
    process.exit(1);
  }
}

main(process.argv[2]);
