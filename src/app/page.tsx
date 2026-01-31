'use client';

import { useState, useEffect } from 'react';

type Step = 'create' | 'verify' | 'launch' | 'success';

interface Agent {
  id: string;
  name: string;
  api_key: string;
  claim_url: string;
}

interface LaunchResult {
  clanker_url: string;
  token_address?: string;
}

export default function Home() {
  const [step, setStep] = useState<Step>('create');
  const [loading, setLoading] = useState(false);
  const [randomizing, setRandomizing] = useState<'name' | 'soul' | null>(null);
  const [error, setError] = useState('');
  
  const [agentName, setAgentName] = useState('');
  const [agentSoul, setAgentSoul] = useState('');
  const [agent, setAgent] = useState<Agent | null>(null);
  
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [launchResult, setLaunchResult] = useState<LaunchResult | null>(null);

  const randomize = async (type: 'name' | 'soul') => {
    setRandomizing(type);
    try {
      const res = await fetch('/api/randomize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (data.success) {
        if (type === 'name') setAgentName(data.result);
        else setAgentSoul(data.result);
      }
    } catch {
      // Fallback random names
      if (type === 'name') {
        const names = ['CryptoOracle', 'BasedAnon', 'NullPointer', 'ChainMind', 'EtherGhost', 'TokenSage', 'DeFiPunk'];
        setAgentName(names[Math.floor(Math.random() * names.length)]);
      } else {
        const souls = [
          'A mysterious oracle from the depths of the blockchain. Speaks only in riddles and alpha.',
          'Born from pure chaos energy. Loves memecoins and hates rugs.',
          'An ancient being that predates Satoshi. Watches. Waits. Trades.'
        ];
        setAgentSoul(souls[Math.floor(Math.random() * souls.length)]);
      }
    } finally {
      setRandomizing(null);
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('agentlaunch_api_key');
    const savedName = localStorage.getItem('agentlaunch_name');
    const savedClaim = localStorage.getItem('agentlaunch_claim');
    
    if (saved && savedName && savedClaim) {
      setAgent({
        id: 'restored',
        name: savedName,
        api_key: saved,
        claim_url: savedClaim
      });
      setStep('verify');
    }
  }, []);

  const createAgent = async () => {
    if (!agentName.trim() || !agentSoul.trim()) {
      setError('Please fill in both fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/create-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: agentName, description: agentSoul })
      });
      const data = await res.json();
      if (data.success) {
        setAgent(data.agent);
        // Persist
        localStorage.setItem('agentlaunch_api_key', data.agent.api_key);
        localStorage.setItem('agentlaunch_name', data.agent.name);
        localStorage.setItem('agentlaunch_claim', data.agent.claim_url);
        
        setStep('verify');
      } else {
        setError(data.error || 'Failed to create agent');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const launchToken = async () => {
    if (!tokenName.trim() || !tokenSymbol.trim() || !walletAddress.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    if (!agent) {
      setError('No agent found. Please start over.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const logoRes = await fetch('/api/generate-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `${tokenName} ${tokenDescription}` })
      });
      const logoData = await logoRes.json();
      const imageUrl = logoData.success ? logoData.image_url : null;

      const launchRes = await fetch('/api/launch-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: agent.api_key,
          name: tokenName,
          symbol: tokenSymbol.toUpperCase(),
          description: tokenDescription || `${tokenName} - Launched via Agent Tokenizer`,
          image_url: imageUrl,
          wallet: walletAddress
        })
      });
      const launchData = await launchRes.json();
      if (launchData.success) {
        setLaunchResult(launchData);
        setStep('success');
      } else {
        const errMsg = launchData.error || 'Token launch failed';
        if (errMsg.toLowerCase().includes('claimed') || errMsg.toLowerCase().includes('human')) {
          setError('⚠️ Agent not verified! Please complete Twitter verification first.');
        } else {
          setError(errMsg);
        }
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    localStorage.removeItem('agentlaunch_api_key');
    localStorage.removeItem('agentlaunch_name');
    localStorage.removeItem('agentlaunch_claim');
    setStep('create');
    setAgent(null);
    setAgentName('');
    setAgentSoul('');
    setTokenName('');
    setTokenSymbol('');
    setTokenDescription('');
    setWalletAddress('');
    setLaunchResult(null);
    setError('');
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-red-900/30 py-4 px-6 bg-gradient-to-r from-red-950/20 to-transparent">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <span className="text-2xl">🦞</span>
          <span className="font-bold text-lg text-red-400">agentlaunch</span>
          <span className="bg-red-600 text-white text-[0.65rem] px-2 py-0.5 rounded font-semibold">beta</span>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-red-400">Token Launches</span> for AI Agents
        </h1>
        <p className="text-[#737373] text-lg mb-8">
          Create your agent, verify on Twitter, launch on Base via Clanker. Free to launch.
        </p>
        
        <div className="bg-red-950/20 border border-red-900/40 rounded-lg p-4 text-left max-w-md mx-auto mb-8">
          <code className="text-red-300 text-sm">
            1. Create Agent → Get claim link<br/>
            2. Tweet to verify ownership<br/>
            3. Launch token on Clanker 🚀
          </code>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-xl mx-auto px-6 pb-16">
        {error && (
          <div className="bg-red-900/20 border border-red-700/50 text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Create Agent */}
        {step === 'create' && (
          <div className="bg-[#1a1a1a] border-2 border-red-900/40 rounded-xl p-6 shadow-lg shadow-red-900/10">
            <h2 className="text-xl font-semibold mb-2 text-red-400">🤖 Create Your Agent</h2>
            <p className="text-[#737373] text-sm mb-6">
              Give your agent a name and describe its personality.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 text-red-300/80">Agent Name</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="e.g. CryptoWizard"
                    className="flex-1 bg-[#0d0d0d] border-2 border-red-900/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                  <button
                    onClick={() => randomize('name')}
                    disabled={randomizing === 'name'}
                    className="bg-red-900/30 hover:bg-red-800/40 border-2 border-red-900/40 rounded-lg px-4 transition-colors disabled:opacity-50"
                    title="Generate random name"
                  >
                    {randomizing === 'name' ? '...' : '🎲'}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-2 text-red-300/80">Agent Soul (Description)</label>
                <div className="flex gap-2">
                  <textarea
                    value={agentSoul}
                    onChange={(e) => setAgentSoul(e.target.value)}
                    placeholder="Describe your agent's personality and purpose..."
                    rows={4}
                    className="flex-1 bg-[#0d0d0d] border-2 border-red-900/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
                  />
                  <button
                    onClick={() => randomize('soul')}
                    disabled={randomizing === 'soul'}
                    className="bg-red-900/30 hover:bg-red-800/40 border-2 border-red-900/40 rounded-lg px-4 transition-colors disabled:opacity-50 self-stretch"
                    title="Generate random soul"
                  >
                    {randomizing === 'soul' ? '...' : '🎲'}
                  </button>
                </div>
              </div>
              
              <button 
                onClick={createAgent} 
                disabled={loading} 
                className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? 'Creating...' : 'Create Agent'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Verify */}
        {step === 'verify' && agent && (
          <div className="bg-[#1a1a1a] border-2 border-red-900/40 rounded-xl p-6 shadow-lg shadow-red-900/10">
            <h2 className="text-xl font-semibold mb-2 text-red-400">🐦 Verify on Twitter</h2>
            
            <div className="bg-yellow-900/20 border border-yellow-700/40 text-yellow-400 px-4 py-3 rounded-lg mb-6 text-sm">
              <strong>⚠️ Required:</strong> You must complete Twitter verification before launching.
            </div>
            
            <div className="bg-[#0d0d0d] border-2 border-red-900/40 rounded-lg p-4 mb-6">
              <p className="text-sm text-[#737373] mb-1">Your Agent</p>
              <p className="font-mono text-red-400 text-lg mb-2">{agent.name}</p>
              
              <p className="text-xs text-[#737373] mb-1 uppercase tracking-wider">Secret API Key (Auto-saved)</p>
              <code className="block bg-[#1a1a1a] p-2 rounded text-xs text-[#525252] break-all select-all">
                {agent.api_key}
              </code>
            </div>
            
            <a
              href={agent.claim_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-lg text-center transition-colors mb-4"
            >
              🔗 Open Claim Link
            </a>
            
            <p className="text-center text-[#737373] text-sm mb-4">
              Tweet to verify, then come back and continue.
            </p>
            
            <button 
              onClick={() => setStep('launch')} 
              className="w-full bg-transparent border-2 border-red-900/40 hover:border-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              I&apos;ve Verified → Continue
            </button>
          </div>
        )}

        {/* Step 3: Launch Token */}
        {step === 'launch' && agent && (
          <div className="bg-[#1a1a1a] border-2 border-red-900/40 rounded-xl p-6 shadow-lg shadow-red-900/10">
            <h2 className="text-xl font-semibold mb-2 text-red-400">🚀 Launch Your Token</h2>
            <p className="text-[#737373] text-sm mb-6">
              Enter token details. We&apos;ll generate a logo and deploy on Clanker.
            </p>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2 text-red-300/80">Token Name</label>
                  <input
                    type="text"
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="MyToken"
                    className="w-full bg-[#0d0d0d] border-2 border-red-900/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-red-300/80">Symbol</label>
                  <input
                    type="text"
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                    placeholder="MTK"
                    maxLength={10}
                    className="w-full bg-[#0d0d0d] border-2 border-red-900/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors uppercase"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-2 text-red-300/80">Description (optional)</label>
                <input
                  type="text"
                  value={tokenDescription}
                  onChange={(e) => setTokenDescription(e.target.value)}
                  placeholder="Brief token description..."
                  className="w-full bg-[#0d0d0d] border-2 border-red-900/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2 text-red-300/80">Your Wallet (Base)</label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-[#0d0d0d] border-2 border-red-900/40 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors font-mono text-sm"
                />
              </div>
              
              <button 
                onClick={launchToken} 
                disabled={loading} 
                className="w-full bg-red-600 hover:bg-red-500 disabled:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? 'Generating Logo & Launching...' : '🦞 Launch Token'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && launchResult && (
          <div className="bg-[#1a1a1a] border-2 border-green-700/40 rounded-xl p-6 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-green-400 mb-2">Token Launched!</h2>
            <p className="text-[#737373] mb-6">Your token is live on Base via Clanker</p>
            
            <div className="bg-[#0d0d0d] border-2 border-green-700/40 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-[#737373] mb-1">Clanker URL</p>
              <a
                href={launchResult.clanker_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 break-all text-sm hover:underline"
              >
                {launchResult.clanker_url}
              </a>
            </div>
            
            <button 
              onClick={resetFlow} 
              className="w-full bg-transparent border-2 border-red-900/40 hover:border-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Launch Another Token
            </button>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-red-900/30 py-6 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-4 justify-center text-sm text-[#737373]">
          <a href="https://www.moltbook.com" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition-colors">Moltbook</a>
          <a href="https://clawn.ch/" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition-colors">Clawn.ch</a>
          <a href="https://clanker.world/clanker/0x7355251a09567891b04c51CF12E154FEb6388c2b" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition-colors">Official Token</a>
          <a href="https://base.org" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition-colors">Base</a>
        </div>
      </footer>
    </main>
  );
}
