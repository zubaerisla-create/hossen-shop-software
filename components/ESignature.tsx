'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ShieldCheck, Edit3, Trash2, CheckSquare } from 'lucide-react';

interface ESignatureProps {
  dealTitle: string;
  totalCost: number;
  onSign: (signatureName: string, signatureImage: string) => void;
  onCancel: () => void;
}

export default function ESignature({ dealTitle, totalCost, onSign, onCancel }: ESignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signName, setSignName] = useState('');
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Setup drawing context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#8b5cf6'; // Violet color signature
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeChecked || !signName || !hasDrawn) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureDataUrl = canvas.toDataURL('image/png');

    onSign(signName, signatureDataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center gap-3">
          <div className="bg-violet-500/10 p-2 rounded-lg border border-violet-500/20 text-violet-400">
            <ShieldCheck className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Online Service Contract & Agreement</h3>
            <p className="text-[10px] text-zinc-400">Hossen Shop Digital Agency Proposal Approval</p>
          </div>
        </div>

        {/* Contract Text Body */}
        <div className="flex-1 overflow-y-auto p-6 text-zinc-400 text-xs space-y-4 leading-relaxed font-sans bg-zinc-950/40">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
            <p className="font-bold text-white text-sm uppercase border-b border-zinc-800 pb-2">CONTRACT FOR SERVICES</p>
            <p>
              This Digital Services Agreement (the "Agreement") is entered into as of the date of signing, by and between{' '}
              <strong className="text-white">Hossen Shop Digital Agency</strong> ("Agency") and the{' '}
              <strong className="text-white">Client</strong> signing below, for development of:{' '}
              <strong className="text-violet-400">{dealTitle}</strong>.
            </p>

            <p className="font-semibold text-zinc-300">1. SCOPE AND REVENUE</p>
            <p>
              The Agency agrees to perform software development services as specified in the Custom Project Briefing.
              The total cost for the deliverables is agreed at <strong className="text-emerald-400">{totalCost.toLocaleString()} BDT</strong>,
              which shall be paid according to the milestone schedule outlined in the project details.
            </p>

            <p className="font-semibold text-zinc-300">2. PAYMENT SCHEDULE (MILESTONES)</p>
            <p>
              Work will begin immediately upon receipt of the <strong className="text-white">Advance Milestone Payment</strong> (amount outlined in the Quotation).
              Subsequent milestones must be reviewed and approved by the Client in the Project Portal. Each approval will generate the invoice and require the payment
              of the next phase's cost before development of that phase initiates.
            </p>

            <p className="font-semibold text-zinc-300">3. INTELLECTUAL PROPERTY & DELIVERY</p>
            <p>
              Upon final milestone payment completion and project delivery, all source codes, credentials, database nodes,
              assets and configurations will be fully transferred to the Client.
            </p>

            <p className="font-semibold text-zinc-300">4. SUPPORT & WARRANTY</p>
            <p>
              The project is backed by a 6-month free warranty period for fixing any performance bottlenecks, crashes, or bugs.
              This warranty does not cover adding new features not outlined in the initial proposal.
            </p>
          </div>

          {/* Form Controls */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">

            {/* Signature Pad Canvas */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-violet-400" /> Draw Your Signature below
                </label>
                {hasDrawn && (
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" /> Clear Signature
                  </button>
                )}
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-36 bg-zinc-950 block"
                />
              </div>
            </div>

            {/* Printed Name Input */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Type Your Legal Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g., Dr. Mahbubul Alam"
                value={signName}
                onChange={(e) => setSignName(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-violet-500 placeholder:text-zinc-600"
              />
            </div>

            {/* Agreement Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer select-none group text-[11px] leading-normal pt-2">
              <input
                type="checkbox"
                checked={agreeChecked}
                onChange={(e) => setAgreeChecked(e.target.checked)}
                className="mt-0.5 accent-violet-600"
              />
              <span className="text-zinc-400 group-hover:text-zinc-300">
                I hereby declare that I have read the terms, understand the milestone payment schedule, and authorize Hossen Shop to initiate development upon signing.
              </span>
            </label>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-zinc-900">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3.5 border border-zinc-800 hover:border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
              >
                Go Back
              </button>
              <button
                type="submit"
                disabled={!agreeChecked || !signName || !hasDrawn}
                className="flex-2 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <CheckSquare className="w-4 h-4" />
                <span>Confirm & Sign Agreement</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
