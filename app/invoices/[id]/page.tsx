'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Invoice } from '../../types';
import { getInvoices } from '../../utils/storage';
import InvoicePrint from '../../components/InvoicePrint';

export default function InvoicePage() {
  const params = useParams();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const list = getInvoices();
    const found = list.find(inv => inv.id === params.id || inv.invoiceNumber === params.id);
    if (found) {
      setInvoice(found);
    }
  }, [params.id]);

  if (!invoice) {
    return (
      <div className="flex flex-col flex-1 bg-black text-zinc-400 justify-center items-center h-screen">
        <p>Loading invoice details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <InvoicePrint
        invoice={invoice}
        onClose={() => router.push('/portal')}
      />
    </div>
  );
}
