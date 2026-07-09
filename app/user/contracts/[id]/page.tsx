'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CustomDeal, ChatMessage } from '../../../types';
import { getDeals, saveDeals, getChats, saveChats } from '../../../utils/storage';
import ESignature from '@/components/ESignature';

export default function ContractPage() {
  const params = useParams();
  const router = useRouter();
  const [deal, setDeal] = useState<CustomDeal | null>(null);

  useEffect(() => {
    const list = getDeals();
    const found = list.find(d => d.id === params.id);
    if (found) {
      setDeal(found);
    }
  }, [params.id]);

  if (!deal || !deal.quotation) {
    return (
      <div className="flex flex-col flex-1 bg-black text-zinc-400 justify-center items-center h-screen">
        <p>Loading contract details...</p>
      </div>
    );
  }

  const handleSign = (name: string, signatureImage: string) => {
    const dealsList = getDeals();
    const updated = dealsList.map(d => {
      if (d.id === deal.id) {
        return {
          ...d,
          contractSigned: true,
          clientSignature: name,
          signedDate: new Date().toISOString().split('T')[0],
          status: 'In Development' as const,
          overallProgress: 10,
          credentials: {
            github: 'https://github.com/client-repo/staging-vault',
            cPanel: 'https://staging.agency.com:2083',
            database: 'PostgreSQL Database node active'
          }
        };
      }
      return d;
    });
    saveDeals(updated);

    // Chat Notification
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer',
      content: `Contract signed electronically by ${name}. Advance payment pending.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const allChats = getChats();
    const thread = allChats[deal.id] || [];
    const updatedChats = {
      ...allChats,
      [deal.id]: [...thread, newMsg]
    };
    saveChats(updatedChats);

    router.push('/user');
  };

  return (
    <div className="min-h-screen bg-black">
      <ESignature
        dealTitle={deal.title}
        totalCost={deal.quotation.totalCost}
        onSign={handleSign}
        onCancel={() => router.push('/user')}
      />
    </div>
  );
}
