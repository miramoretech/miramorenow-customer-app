import { useState, useEffect } from 'react';
import { useFlutterwave } from 'flutterwave-react-v3';
import { supabase } from '@/lib/supabase';

interface Transaction {
  id: string;
  amount: number;
  transaction_type: 'CREDIT' | 'DEBIT';
  status: string;
  created_at: string;
  description?: string;
}

const FLW_PUBLIC_KEY = "FLWPUBK-a4dc9522e8b015ae0f4ae2f39b05be30-X";

export default function Wallet() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState(1000);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [fundingLoading, setFundingLoading] = useState(false);

  // Fetch user and wallet data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);
      setUserEmail(user.email || '');

      // Try to fetch profile (name, phone) – if no profiles table, skip gracefully
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('user_id', user.id)
          .single();
        if (profile) {
          setUserName(profile.full_name || '');
          setUserPhone(profile.phone || '');
        }
      } catch (err) {
        console.warn('Profiles table not found or no profile data');
      }

      // Wallet balance
      const { data: wallet } = await supabase
        .from('customer_wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      setBalance(wallet?.balance || 0);

      // Transaction history
      const { data: txns } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setTransactions(txns || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const generateTxRef = () => `miramore_wallet_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  // Only enable funding if we have a valid email
  const canFund = !!userEmail && amount >= 100;

  const config = {
    public_key: FLW_PUBLIC_KEY,
    tx_ref: generateTxRef(),
    amount: amount,
    currency: 'NGN',
    payment_options: 'card,ussd,banktransfer',
    customer: {
      email: userEmail,
      phone_number: userPhone || '08000000000',
      name: userName || 'Customer',
    },
    customizations: {
      title: 'MiramoreNow Wallet Funding',
      description: `Add ₦${amount.toLocaleString()} to your wallet`,
      logo: 'https://your-logo-url.com/logo.png',
    },
  };

  const handleFlutterPayment = useFlutterwave(config);

  const saveFundingRequest = async (tx_ref: string, amount: number) => {
    if (!userId) return;
    await supabase.from('wallet_funding_requests').insert({
      user_id: userId,
      amount: amount,
      flutterwave_tx_ref: tx_ref,
      status: 'PENDING',
    });
  };

  const onSuccess = async (response: any) => {
    await saveFundingRequest(response.tx_ref, amount);
    alert(`Payment successful! ₦${amount.toLocaleString()} will be credited to your wallet shortly.`);
    setTimeout(() => window.location.reload(), 5000);
  };

  const handleFundWallet = () => {
    if (!canFund) {
      if (!userEmail) alert('Please wait for user info to load or refresh the page.');
      else if (amount < 100) alert('Minimum funding amount is ₦100');
      return;
    }
    setFundingLoading(true);
    handleFlutterPayment({
      callback: onSuccess,
      onClose: () => {
        setFundingLoading(false);
        console.log('Payment modal closed');
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-6 text-white shadow-lg mb-6">
          <p className="text-sm opacity-80">Wallet Balance</p>
          <p className="text-3xl font-bold">₦{balance.toLocaleString()}</p>
        </div>

        {/* Fund Wallet */}
        <div className="bg-white rounded-xl p-4 shadow mb-6">
          <h2 className="font-bold text-lg mb-3">Fund Wallet</h2>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="flex-1 border rounded-lg px-3 py-2"
              placeholder="Amount (₦)"
            />
            <button
              onClick={handleFundWallet}
              disabled={fundingLoading || !canFund}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {fundingLoading ? 'Processing...' : 'Fund'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Min. ₦100. Card, Bank Transfer, USSD accepted.</p>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-xl p-4 shadow">
          <h2 className="font-bold text-lg mb-3">Transaction History</h2>
          {transactions.length === 0 && <p className="text-gray-500 text-sm">No transactions yet.</p>}
          <div className="space-y-2">
            {transactions.map((tx) => (
              <div key={tx.id} className="border-b pb-2 flex justify-between items-center">
                <div>
                  <p className="font-medium">
                    {tx.transaction_type === 'CREDIT' ? '💰 Credit' : '💸 Debit'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(tx.created_at).toLocaleString()}
                  </p>
                </div>
                <p className={`font-bold ${tx.transaction_type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.transaction_type === 'CREDIT' ? '+' : '-'} ₦{tx.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}