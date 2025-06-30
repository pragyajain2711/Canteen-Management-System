import React from 'react';
import { ChefHat } from 'lucide-react'; // or from whichever icon library you're using

function Footer() {
  return (
    <footer className="bg-slate-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center items-center space-x-3 mb-4">
          <div className="bg-blue-600 p-2 rounded-lg">
            <ChefHat className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold">Office Canteen</span>
        </div>
        <p className="text-slate-400">Serving delicious meals with love since 2020</p>
        <p className="text-slate-500 text-sm mt-2">Open: 7:00 AM - 9:00 PM | Monday to Saturday</p>
      </div>
    </footer>
  );
}

export default Footer;