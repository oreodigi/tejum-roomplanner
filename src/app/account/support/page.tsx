'use client';

import { LifeBuoy, MessageCircle, Phone, Mail } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support & Contact</h1>
        <p className="text-text-secondary text-sm mt-1">
          Get help with your smart home plan
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="glass-card-static p-6 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold">WhatsApp Expert</h3>
          <p className="text-sm text-text-secondary">Chat directly with a smart home consultant</p>
          <button className="btn-secondary w-full mt-2">Start Chat</button>
        </div>
        <div className="glass-card-static p-6 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="font-bold">Call Us</h3>
          <p className="text-sm text-text-secondary">Speak to our planning team (Mon-Sat, 10 AM - 7 PM)</p>
          <a href="tel:+919876543210" className="btn-secondary w-full mt-2">Call Now</a>
        </div>
        <div className="glass-card-static p-6 flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-bold">Email Support</h3>
          <p className="text-sm text-text-secondary">Send us your floor plans or queries</p>
          <a href="mailto:support@tejum.com" className="btn-secondary w-full mt-2">Email Us</a>
        </div>
      </div>
    </div>
  );
}
