
/**
 * AEGIS_PRISM | Elite Offensive Orchestrator
 * Type System v7.0 | Standalone Optimized
 */

export enum View {
  DASHBOARD = 'DASHBOARD',
  PENTEST = 'PENTEST',
  NETWORK = 'NETWORK',
  TOOLBOX = 'TOOLBOX',
  PAYLOADS = 'PAYLOADS',
  CRYPTO = 'CRYPTO',
  CRYPTO_CHAINS = 'CRYPTO_CHAINS',
  DEOBFUSCATOR = 'DEOBFUSCATOR',
  HACKBOT = 'HACKBOT',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS'
}

export type PentestWorkflow = 'RECONNAISSANCE' | 'THREAT_HUNTING' | 'LOGIC_ASSESSMENT' | 'ADVANCED_RESEARCH';
export type ScanIntensity = 'QUICK' | 'DEEP' | 'TARGETED';
export type PentestScope = 'WEB_APP' | 'API_ENDPOINTS' | 'INFRASTRUCTURE' | 'CLOUD_BUCKETS' | 'SUBDOMAINS';

export enum EncryptionSuite {
  PERSONAL = 'PERSONAL',
  ENTERPRISE = 'ENTERPRISE',
  BANK = 'BANK'
}

export enum EncryptionMode {
  AES_GCM = '1',
  AES_CCM = '2',
  CHACHA20_POLY1305 = '3',
  AES_GCM_SIV = '4',
  AES_CTR_HMAC_SHA512 = '5',
  XCHACHA20_POLY1305 = '6',
  AES_CBC_HMAC_SHA256 = '7',
  AES_OCB = '8',
  UNIFIED_PRISM = '9'
}

export interface ThoughtStep {
  id: string;
  label: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'ERROR';
  details?: string;
}

export interface ScanLog {
  msg: string;
  type: 'info' | 'warn' | 'error' | 'success' | 'ai';
}

export interface ScanResult {
  vulnerability: string;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  impact: string;
  remediation: string;
  exploitPoC?: string; 
  attackChain?: string[]; 
  cveId?: string;
  references?: string[];
}

export interface AuditLogEntry {
  timestamp: string;
  event: string;
  details: string;
}

export interface Report {
  id: string;
  title: string;
  date: string;
  status: 'Draft' | 'Finalized' | 'Archived';
  owner: string;
  data: ScanResult[];
}

export interface HackingTool {
  name: string;
  category: string;
  description: string;
  usage: string;
  icon: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  documentation?: string;
}

export interface ExploitPayload {
  name: string;
  code: string;
  desc: string;
  category: string;
}

export interface NetworkPort {
  port: number;
  service: string;
  version: string;
  severity: 'low' | 'medium' | 'high';
}

export interface Host {
  ip: string;
  hostname: string;
  status: 'UP' | 'DOWN';
  mac: string;
  vendor: string;
  os: 'Linux' | 'Windows' | 'Cisco' | 'Darwin' | 'IoT';
  riskScore: number;
  tags: string[];
  ports: NetworkPort[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  clearance: 'OMEGA' | 'SIGMA' | 'DELTA';
  avatar?: string;
}

export interface PrismChain {
  id: string;
  name: string;
  description: string;
  modes: EncryptionMode[];
  createdAt: string;
}
