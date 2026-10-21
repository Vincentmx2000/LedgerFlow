import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  Users,
  ArrowLeftRight,
  Landmark,
  PieChart,
  CalendarClock,
  Check,
  Menu,
  X,
} from 'lucide-react';

export const Landing = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#111827] font-manrope selection:bg-[#0F766E]/20 selection:text-[#0F766E]">
      {/* 1. HEADER */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-[#F7F8FA]/90 backdrop-blur-md">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 xl:px-16 h-18 lg:h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-lg bg-[#0F766E] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Layers className="h-5 w-5 stroke-[2]" />
            </div>
            <span className="text-xl lg:text-2xl font-bold tracking-tight text-[#111827]">
              LedgerFlow
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm lg:text-[16px] font-medium text-[#4B5563]">
            <a
              href="#modules"
              className="hover:text-[#0F766E] transition-colors"
            >
              Modules
            </a>
            <a
              href="#flow"
              className="hover:text-[#0F766E] transition-colors"
            >
              How it connects
            </a>
            <a
              href="#steps"
              className="hover:text-[#0F766E] transition-colors"
            >
              Quick tour
            </a>
          </nav>

          {/* Desktop Sign In Button */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="min-h-[44px] h-11 lg:h-12 px-5 lg:px-6 rounded-lg bg-[#0F766E] hover:bg-[#0D655E] text-white text-sm lg:text-[16px] font-semibold inline-flex items-center justify-center transition-colors shadow-sm"
            >
              Sign in
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden min-h-[44px] min-w-[44px] flex items-center justify-center text-[#111827] rounded-lg border border-gray-200 bg-white"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 stroke-[2]" />
            ) : (
              <Menu className="h-5 w-5 stroke-[2]" />
            )}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-gray-200 bg-white px-6 py-4 space-y-3 animate-in fade-in slide-in-from-top-2">
            <a
              href="#modules"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#4B5563] hover:text-[#0F766E] py-2"
            >
              Modules
            </a>
            <a
              href="#flow"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#4B5563] hover:text-[#0F766E] py-2"
            >
              How it connects
            </a>
            <a
              href="#steps"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-[#4B5563] hover:text-[#0F766E] py-2"
            >
              Quick tour
            </a>
            <div className="pt-2">
              <Link
                to="/login"
                className="w-full min-h-[44px] h-11 px-5 rounded-lg bg-[#0F766E] hover:bg-[#0D655E] text-white text-sm font-semibold inline-flex items-center justify-center transition-colors shadow-sm"
              >
                Sign in
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO */}
      <section className="py-16 lg:pt-24 lg:pb-[120px]">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-12 lg:gap-20 items-center">
            {/* Left Column */}
            <div className="space-y-6 lg:space-y-8">
              <div className="inline-block">
                <span className="font-mono text-xs lg:text-[14px] font-bold uppercase tracking-widest text-[#0F766E] bg-[#0F766E]/10 border border-[#0F766E]/20 px-3 py-1 lg:px-3.5 lg:py-1.5 rounded-full">
                  SMART LEDGER MANAGEMENT SYSTEM
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-[72px] lg:leading-[1.05] 2xl:text-[80px] font-extrabold tracking-tight text-[#111827] leading-[1.18]">
                Every rupee recorded, and reserved for a reason.
              </h1>

              <p className="text-base sm:text-lg lg:text-[21px] lg:leading-relaxed text-[#4B5563] leading-relaxed max-w-xl lg:max-w-[560px]">
                LedgerFlow keeps your contacts, money movements, shared bills,
                savings goals and upcoming payments together in one simple,
                connected workspace.
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-4 pt-2 lg:pt-4">
                <Link
                  to="/login"
                  className="min-h-[44px] h-11 lg:h-[56px] px-6 lg:px-8 rounded-lg bg-[#0F766E] hover:bg-[#0D655E] text-white text-sm lg:text-[17px] font-semibold inline-flex items-center justify-center transition-colors shadow-sm"
                >
                  Sign in to get started
                </Link>

                <a
                  href="#modules"
                  className="min-h-[44px] h-11 lg:h-[56px] px-6 lg:px-8 rounded-lg bg-white border border-gray-300 hover:border-gray-400 text-[#111827] text-sm lg:text-[17px] font-semibold inline-flex items-center justify-center transition-colors shadow-sm"
                >
                  Explore the modules
                </a>

                <Link
                  to="/register"
                  className="min-h-[44px] inline-flex items-center font-semibold text-[#0F766E] hover:underline underline-offset-4 text-sm lg:text-[17px] px-2"
                >
                  Create an account
                </Link>
              </div>
            </div>

            {/* Right Column: Two White Sample Cards */}
            <div className="space-y-4 lg:space-y-6">
              <div className="text-[11px] lg:text-[13px] font-mono text-[#6B7280] tracking-wide">
                Sample data, shown for illustration
              </div>

              {/* Card 1: Computer Fund */}
              <div className="bg-white rounded-xl lg:rounded-[24px] border border-gray-200/90 p-5 lg:p-8 shadow-sm space-y-3 lg:space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg lg:rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center">
                      <Landmark className="h-4 w-4 lg:h-5 lg:w-5 stroke-[1.75]" />
                    </div>
                    <span className="font-bold text-base lg:text-[20px] text-[#111827]">
                      Computer Fund
                    </span>
                  </div>
                  <span className="text-[11px] lg:text-[13px] font-semibold text-[#0F766E] bg-[#0F766E]/10 border border-[#0F766E]/20 px-2.5 py-0.5 lg:px-3 lg:py-1 rounded-full">
                    In Progress
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1 lg:pt-2">
                  <div>
                    <span className="text-[11px] lg:text-[13px] font-medium text-[#6B7280] block">
                      Saved Allocated
                    </span>
                    <span className="text-xl lg:text-[32px] lg:leading-tight font-bold font-mono text-[#111827]">
                      ₹75,000
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] lg:text-[13px] font-medium text-[#6B7280] block">
                      Target Ceiling
                    </span>
                    <span className="text-sm lg:text-[18px] lg:leading-tight font-semibold font-mono text-[#4B5563]">
                      ₹1,00,000
                    </span>
                  </div>
                </div>

                {/* 75% progress bar */}
                <div className="space-y-1.5 lg:space-y-2 pt-1 lg:pt-2">
                  <div className="h-2.5 lg:h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0F766E] rounded-full transition-all duration-500"
                      style={{ width: '75%' }}
                    />
                  </div>
                  <div className="text-right">
                    <span className="text-xs lg:text-[14px] font-mono font-semibold text-[#0F766E]">
                      Goal Status: 75%
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Split & Collect ₹10,000 */}
              <div className="bg-white rounded-xl lg:rounded-[24px] border border-gray-200/90 p-5 lg:p-8 shadow-sm space-y-3 lg:space-y-5">
                <div className="flex items-center justify-between pb-1 lg:pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-2 lg:gap-3">
                    <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-lg lg:rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center">
                      <PieChart className="h-4 w-4 lg:h-5 lg:w-5 stroke-[1.75]" />
                    </div>
                    <span className="font-bold text-base lg:text-[20px] text-[#111827]">
                      Split &amp; Collect ₹10,000
                    </span>
                  </div>
                </div>

                {/* Participants List */}
                <div className="space-y-2 lg:space-y-3 text-xs">
                  <div className="flex items-center justify-between py-1 lg:py-0 px-2 lg:px-4 rounded-lg bg-[#F7F8FA] lg:h-[52px]">
                    <span className="font-medium text-[#111827] lg:text-[15px]">Party A</span>
                    <div className="flex items-center gap-2 lg:gap-3">
                      <span className="font-mono font-semibold text-[#111827] lg:text-[16px]">
                        ₹4,000
                      </span>
                      <span className="text-[10px] lg:text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 lg:px-2.5 lg:py-1 rounded flex items-center gap-1">
                        <Check className="h-2.5 w-2.5 lg:h-3 lg:w-3 stroke-[2]" />
                        Paid
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1 lg:py-0 px-2 lg:px-4 rounded-lg bg-[#F7F8FA] lg:h-[52px]">
                    <span className="font-medium text-[#111827] lg:text-[15px]">Party B</span>
                    <div className="flex items-center gap-2 lg:gap-3">
                      <span className="font-mono font-semibold text-[#111827] lg:text-[16px]">
                        ₹3,500
                      </span>
                      <span className="text-[10px] lg:text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 lg:px-2.5 lg:py-1 rounded flex items-center gap-1">
                        <Check className="h-2.5 w-2.5 lg:h-3 lg:w-3 stroke-[2]" />
                        Paid
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-1 lg:py-0 px-2 lg:px-4 rounded-lg bg-[#F7F8FA] lg:h-[52px]">
                    <span className="font-medium text-[#111827] lg:text-[15px]">Party C</span>
                    <div className="flex items-center gap-2 lg:gap-3">
                      <span className="font-mono font-semibold text-[#111827] lg:text-[16px]">
                        ₹2,500
                      </span>
                      <span className="text-[10px] lg:text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 lg:px-2.5 lg:py-1 rounded">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>

                {/* Teal Note */}
                <div className="text-xs lg:text-[14px] text-[#0F766E] bg-[#0F766E]/10 border border-[#0F766E]/20 rounded-lg px-3 py-2 lg:px-4 lg:py-3 flex items-center gap-2 font-medium">
                  <div className="h-1.5 w-1.5 lg:h-2 lg:w-2 rounded-full bg-[#0F766E]" />
                  <span>Shares add up to the total · Balanced</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MODULES (id="modules", white band) */}
      <section id="modules" className="bg-white py-16 lg:py-[120px] 2xl:py-[140px] border-y border-gray-200/70">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 xl:px-16">
          <div className="mb-12 lg:mb-16">
            <span className="font-mono text-xs lg:text-[14px] font-bold uppercase tracking-widest text-[#0F766E] mb-2 lg:mb-3 block">
              What's inside
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-[48px] lg:leading-tight font-extrabold tracking-tight text-[#111827]">
              Five modules, one ledger
            </h2>
          </div>

          {/* 5 Cards Grid: 3 on row 1, 2 on row 2 stretching 3 spans each */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 lg:gap-7">
            {/* Card 1: People */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-[#F7F8FA] rounded-xl lg:rounded-2xl border border-gray-200/80 p-6 lg:p-10 flex flex-col justify-between hover:border-[#0F766E]/40 transition-colors shadow-2xs lg:min-h-[340px]">
              <div>
                <div className="h-11 w-11 lg:h-14 lg:w-14 rounded-lg lg:rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center mb-4 lg:mb-6">
                  <Users className="h-5 w-5 lg:h-7 lg:w-7 stroke-[1.75]" />
                </div>
                <h3 className="text-lg lg:text-[24px] lg:leading-snug font-bold text-[#111827] mb-2 lg:mb-3">
                  People
                </h3>
                <p className="text-sm lg:text-[17px] lg:leading-relaxed text-[#4B5563] leading-relaxed mb-6 lg:mb-8">
                  Keep every customer, supplier and staff contact in one searchable directory.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 lg:gap-2 pt-2">
                {['Add', 'Search', 'Edit'].map((chip) => (
                  <span
                    key={chip}
                    className="bg-white text-[#4B5563] border border-gray-200 text-xs lg:text-[13px] px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-md font-medium"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            {/* Card 2: Transactions */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-[#F7F8FA] rounded-xl lg:rounded-2xl border border-gray-200/80 p-6 lg:p-10 flex flex-col justify-between hover:border-[#0F766E]/40 transition-colors shadow-2xs lg:min-h-[340px]">
              <div>
                <div className="h-11 w-11 lg:h-14 lg:w-14 rounded-lg lg:rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center mb-4 lg:mb-6">
                  <ArrowLeftRight className="h-5 w-5 lg:h-7 lg:w-7 stroke-[1.75]" />
                </div>
                <h3 className="text-lg lg:text-[24px] lg:leading-snug font-bold text-[#111827] mb-2 lg:mb-3">
                  Transactions
                </h3>
                <p className="text-sm lg:text-[17px] lg:leading-relaxed text-[#4B5563] leading-relaxed mb-6 lg:mb-8">
                  Record every money movement with its type, amount, date and the person it involves.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 lg:gap-2 pt-2">
                {['Sale', 'Purchase', 'Payment', 'Receipt', 'Expense'].map((chip) => (
                  <span
                    key={chip}
                    className="bg-white text-[#4B5563] border border-gray-200 text-xs lg:text-[13px] px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-md font-medium"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            {/* Card 3: Vault */}
            <div className="col-span-1 md:col-span-2 lg:col-span-2 bg-[#F7F8FA] rounded-xl lg:rounded-2xl border border-gray-200/80 p-6 lg:p-10 flex flex-col justify-between hover:border-[#0F766E]/40 transition-colors shadow-2xs lg:min-h-[340px]">
              <div>
                <div className="h-11 w-11 lg:h-14 lg:w-14 rounded-lg lg:rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center mb-4 lg:mb-6">
                  <Landmark className="h-5 w-5 lg:h-7 lg:w-7 stroke-[1.75]" />
                </div>
                <h3 className="text-lg lg:text-[24px] lg:leading-snug font-bold text-[#111827] mb-2 lg:mb-3">
                  Vault
                </h3>
                <p className="text-sm lg:text-[17px] lg:leading-relaxed text-[#4B5563] leading-relaxed mb-6 lg:mb-8">
                  Create goal wallets like a Computer Fund or Tax Fund, set a target and add cash until it is met.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 lg:gap-2 pt-2">
                {['Set target', 'Add cash', 'Target met'].map((chip) => (
                  <span
                    key={chip}
                    className="bg-white text-[#4B5563] border border-gray-200 text-xs lg:text-[13px] px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-md font-medium"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            {/* Card 4: Split & Collect */}
            <div className="col-span-1 md:col-span-3 lg:col-span-3 bg-[#F7F8FA] rounded-xl lg:rounded-2xl border border-gray-200/80 p-6 lg:p-10 flex flex-col justify-between hover:border-[#0F766E]/40 transition-colors shadow-2xs lg:min-h-[340px]">
              <div>
                <div className="h-11 w-11 lg:h-14 lg:w-14 rounded-lg lg:rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center mb-4 lg:mb-6">
                  <PieChart className="h-5 w-5 lg:h-7 lg:w-7 stroke-[1.75]" />
                </div>
                <h3 className="text-lg lg:text-[24px] lg:leading-snug font-bold text-[#111827] mb-2 lg:mb-3">
                  Split &amp; Collect
                </h3>
                <p className="text-sm lg:text-[17px] lg:leading-relaxed text-[#4B5563] leading-relaxed mb-6 lg:mb-8">
                  Divide one payment among several people, check the shares add up to the total, and mark each share Paid as it comes in.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 lg:gap-2 pt-2">
                {['Split equally', 'Running total', 'Mark paid'].map((chip) => (
                  <span
                    key={chip}
                    className="bg-white text-[#4B5563] border border-gray-200 text-xs lg:text-[13px] px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-md font-medium"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            {/* Card 5: Planner */}
            <div className="col-span-1 md:col-span-3 lg:col-span-3 bg-[#F7F8FA] rounded-xl lg:rounded-2xl border border-gray-200/80 p-6 lg:p-10 flex flex-col justify-between hover:border-[#0F766E]/40 transition-colors shadow-2xs lg:min-h-[340px]">
              <div>
                <div className="h-11 w-11 lg:h-14 lg:w-14 rounded-lg lg:rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center mb-4 lg:mb-6">
                  <CalendarClock className="h-5 w-5 lg:h-7 lg:w-7 stroke-[1.75]" />
                </div>
                <h3 className="text-lg lg:text-[24px] lg:leading-snug font-bold text-[#111827] mb-2 lg:mb-3">
                  Planner
                </h3>
                <p className="text-sm lg:text-[17px] lg:leading-relaxed text-[#4B5563] leading-relaxed mb-6 lg:mb-8">
                  Schedule upcoming payments, collections and expenses, and see at a glance what is due today or overdue.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 lg:gap-2 pt-2">
                {['Schedule', 'Due today', 'Overdue', 'Mark completed'].map((chip) => (
                  <span
                    key={chip}
                    className="bg-white text-[#4B5563] border border-gray-200 text-xs lg:text-[13px] px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-md font-medium"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT CONNECTS (id="flow") */}
      <section id="flow" className="py-16 lg:py-[120px] 2xl:py-[140px]">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 xl:px-16">
          <div className="mb-10 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-[48px] lg:leading-tight font-extrabold tracking-tight text-[#111827] mb-2 lg:mb-4">
              Your people sit at the centre
            </h2>
            <p className="text-[#4B5563] text-sm sm:text-base lg:text-[20px] lg:leading-relaxed max-w-2xl lg:max-w-[680px] leading-relaxed">
              Add a contact once and use them everywhere. Vault works alongside, setting money aside for a goal.
            </p>
          </div>

          <div className="space-y-4 lg:space-y-8">
            {/* Row 1: People -> Transactions */}
            <div className="bg-white rounded-xl lg:rounded-2xl border border-gray-200/80 p-5 lg:p-8 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-8">
              <div className="flex items-center gap-3 lg:gap-5 shrink-0">
                <div className="bg-[#F7F8FA] border border-gray-300/80 px-4 py-2 lg:px-6 rounded-lg lg:rounded-xl font-semibold text-xs sm:text-sm lg:text-[18px] text-[#111827] min-w-[95px] lg:min-w-[200px] h-auto lg:h-16 flex items-center justify-center text-center shadow-2xs">
                  People
                </div>
                <div className="flex items-center text-[#0F766E] px-1 lg:px-2">
                  <span className="w-6 sm:w-10 lg:w-[120px] h-0.5 bg-[#0F766E] inline-block" />
                  <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 -ml-1 stroke-[2]" />
                </div>
                <div className="bg-[#F7F8FA] border border-gray-300/80 px-4 py-2 lg:px-6 rounded-lg lg:rounded-xl font-semibold text-xs sm:text-sm lg:text-[18px] text-[#111827] min-w-[130px] lg:min-w-[200px] h-auto lg:h-16 flex items-center justify-center text-center shadow-2xs">
                  Transactions
                </div>
              </div>
              <p className="text-sm lg:text-[20px] lg:leading-relaxed text-[#4B5563] md:text-right max-w-md lg:max-w-xl">
                A contact is the party on a sale, purchase, payment or receipt.
              </p>
            </div>

            {/* Row 2: People -> Split & Collect */}
            <div className="bg-white rounded-xl lg:rounded-2xl border border-gray-200/80 p-5 lg:p-8 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-8">
              <div className="flex items-center gap-3 lg:gap-5 shrink-0">
                <div className="bg-[#F7F8FA] border border-gray-300/80 px-4 py-2 lg:px-6 rounded-lg lg:rounded-xl font-semibold text-xs sm:text-sm lg:text-[18px] text-[#111827] min-w-[95px] lg:min-w-[200px] h-auto lg:h-16 flex items-center justify-center text-center shadow-2xs">
                  People
                </div>
                <div className="flex items-center text-[#0F766E] px-1 lg:px-2">
                  <span className="w-6 sm:w-10 lg:w-[120px] h-0.5 bg-[#0F766E] inline-block" />
                  <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 -ml-1 stroke-[2]" />
                </div>
                <div className="bg-[#F7F8FA] border border-gray-300/80 px-4 py-2 lg:px-6 rounded-lg lg:rounded-xl font-semibold text-xs sm:text-sm lg:text-[18px] text-[#111827] min-w-[130px] lg:min-w-[200px] h-auto lg:h-16 flex items-center justify-center text-center shadow-2xs">
                  Split &amp; Collect
                </div>
              </div>
              <p className="text-sm lg:text-[20px] lg:leading-relaxed text-[#4B5563] md:text-right max-w-md lg:max-w-xl">
                Contacts become the participants who share a bill.
              </p>
            </div>

            {/* Row 3: People -> Planner */}
            <div className="bg-white rounded-xl lg:rounded-2xl border border-gray-200/80 p-5 lg:p-8 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-8">
              <div className="flex items-center gap-3 lg:gap-5 shrink-0">
                <div className="bg-[#F7F8FA] border border-gray-300/80 px-4 py-2 lg:px-6 rounded-lg lg:rounded-xl font-semibold text-xs sm:text-sm lg:text-[18px] text-[#111827] min-w-[95px] lg:min-w-[200px] h-auto lg:h-16 flex items-center justify-center text-center shadow-2xs">
                  People
                </div>
                <div className="flex items-center text-[#0F766E] px-1 lg:px-2">
                  <span className="w-6 sm:w-10 lg:w-[120px] h-0.5 bg-[#0F766E] inline-block" />
                  <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 -ml-1 stroke-[2]" />
                </div>
                <div className="bg-[#F7F8FA] border border-gray-300/80 px-4 py-2 lg:px-6 rounded-lg lg:rounded-xl font-semibold text-xs sm:text-sm lg:text-[18px] text-[#111827] min-w-[130px] lg:min-w-[200px] h-auto lg:h-16 flex items-center justify-center text-center shadow-2xs">
                  Planner
                </div>
              </div>
              <p className="text-sm lg:text-[20px] lg:leading-relaxed text-[#4B5563] md:text-right max-w-md lg:max-w-xl">
                Attach a contact to any planned payment or collection.
              </p>
            </div>

            {/* Dashed divider */}
            <div className="border-t border-dashed border-gray-300 my-4 lg:my-8" />

            {/* Row 4: Your money -> Vault (teal) */}
            <div className="bg-white rounded-xl lg:rounded-2xl border border-gray-200/80 p-5 lg:p-8 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-8">
              <div className="flex items-center gap-3 lg:gap-5 shrink-0">
                <div className="bg-[#F7F8FA] border border-gray-300/80 px-4 py-2 lg:px-6 rounded-lg lg:rounded-xl font-semibold text-xs sm:text-sm lg:text-[18px] text-[#111827] min-w-[95px] lg:min-w-[200px] h-auto lg:h-16 flex items-center justify-center text-center shadow-2xs">
                  Your money
                </div>
                <div className="flex items-center text-[#0F766E] px-1 lg:px-2">
                  <span className="w-6 sm:w-10 lg:w-[120px] h-0.5 bg-[#0F766E] inline-block" />
                  <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 -ml-1 stroke-[2]" />
                </div>
                <div className="bg-[#0F766E] border border-[#0F766E] text-white px-4 py-2 lg:px-6 rounded-lg lg:rounded-xl font-semibold text-xs sm:text-sm lg:text-[18px] min-w-[130px] lg:min-w-[200px] h-auto lg:h-16 flex items-center justify-center text-center shadow-sm">
                  Vault
                </div>
              </div>
              <p className="text-sm lg:text-[20px] lg:leading-relaxed text-[#4B5563] md:text-right max-w-md lg:max-w-xl">
                Reserves funds for one purpose and tracks them to the target.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. QUICK TOUR (id="steps", white band) */}
      <section id="steps" className="bg-white py-16 lg:py-[120px] 2xl:py-[140px] border-y border-gray-200/70">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 xl:px-16">
          <div className="mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-[48px] lg:leading-tight font-extrabold tracking-tight text-[#111827]">
              Up and running in four steps
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-10">
            {/* Step 1 */}
            <div className="border-t-4 border-[#0F766E] bg-[#F7F8FA] rounded-xl lg:rounded-2xl border-x border-b border-gray-200/80 p-6 lg:p-8 shadow-2xs flex flex-col justify-between lg:min-h-[260px]">
              <div>
                <span className="font-mono text-xs lg:text-[16px] font-bold text-[#0F766E] tracking-wider block mb-3 lg:mb-4">
                  01
                </span>
                <h3 className="font-bold text-base lg:text-[24px] lg:leading-snug text-[#111827] mb-2 lg:mb-3">
                  Add your people
                </h3>
                <p className="text-xs sm:text-sm lg:text-[17px] lg:leading-relaxed text-[#4B5563] leading-relaxed">
                  Enter customers, suppliers and staff once so they are ready to pick everywhere else.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="border-t-4 border-[#0F766E] bg-[#F7F8FA] rounded-xl lg:rounded-2xl border-x border-b border-gray-200/80 p-6 lg:p-8 shadow-2xs flex flex-col justify-between lg:min-h-[260px]">
              <div>
                <span className="font-mono text-xs lg:text-[16px] font-bold text-[#0F766E] tracking-wider block mb-3 lg:mb-4">
                  02
                </span>
                <h3 className="font-bold text-base lg:text-[24px] lg:leading-snug text-[#111827] mb-2 lg:mb-3">
                  Record transactions
                </h3>
                <p className="text-xs sm:text-sm lg:text-[17px] lg:leading-relaxed text-[#4B5563] leading-relaxed">
                  Log each sale, purchase, payment, receipt or expense as it happens.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="border-t-4 border-[#0F766E] bg-[#F7F8FA] rounded-xl lg:rounded-2xl border-x border-b border-gray-200/80 p-6 lg:p-8 shadow-2xs flex flex-col justify-between lg:min-h-[260px]">
              <div>
                <span className="font-mono text-xs lg:text-[16px] font-bold text-[#0F766E] tracking-wider block mb-3 lg:mb-4">
                  03
                </span>
                <h3 className="font-bold text-base lg:text-[24px] lg:leading-snug text-[#111827] mb-2 lg:mb-3">
                  Plan, split and save
                </h3>
                <p className="text-xs sm:text-sm lg:text-[17px] lg:leading-relaxed text-[#4B5563] leading-relaxed">
                  Schedule what's coming, share bills fairly, and set money aside in a Vault.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="border-t-4 border-[#0F766E] bg-[#F7F8FA] rounded-xl lg:rounded-2xl border-x border-b border-gray-200/80 p-6 lg:p-8 shadow-2xs flex flex-col justify-between lg:min-h-[260px]">
              <div>
                <span className="font-mono text-xs lg:text-[16px] font-bold text-[#0F766E] tracking-wider block mb-3 lg:mb-4">
                  04
                </span>
                <h3 className="font-bold text-base lg:text-[24px] lg:leading-snug text-[#111827] mb-2 lg:mb-3">
                  Track to done
                </h3>
                <p className="text-xs sm:text-sm lg:text-[17px] lg:leading-relaxed text-[#4B5563] leading-relaxed">
                  Mark shares Paid, plans Completed and watch Vaults reach their targets.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CLOSING TEAL BANNER */}
      <section className="py-16 lg:py-[120px] 2xl:py-[140px]">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 xl:px-16">
          <div className="bg-[#0F766E] text-white rounded-2xl lg:rounded-3xl p-8 sm:p-12 lg:py-[120px] lg:px-12 text-center shadow-sm">
            <h2 className="text-2xl sm:text-3xl lg:text-[52px] lg:leading-tight font-extrabold tracking-tight mb-3 lg:mb-5">
              Ready to try LedgerFlow?
            </h2>
            <p className="text-teal-50 text-sm sm:text-base lg:text-[20px] lg:leading-relaxed max-w-lg lg:max-w-2xl mx-auto mb-8 lg:mb-12 leading-relaxed">
              Sign in to start recording transactions, or create an account in a minute.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-5">
              <Link
                to="/login"
                className="w-full sm:w-auto min-h-[44px] h-11 lg:h-[56px] px-7 lg:px-9 rounded-lg lg:rounded-xl bg-white text-[#0F766E] hover:bg-teal-50 text-sm lg:text-[17px] font-bold inline-flex items-center justify-center transition-colors shadow-sm"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="w-full sm:w-auto min-h-[44px] h-11 lg:h-[56px] px-7 lg:px-9 rounded-lg lg:rounded-xl border border-white/80 hover:bg-white/10 text-white text-sm lg:text-[17px] font-medium inline-flex items-center justify-center transition-colors"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="border-t border-gray-200/80 py-8 lg:py-12 bg-[#F7F8FA]">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 xl:px-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs lg:text-[15px] text-[#6B7280]">
          <div>LedgerFlow · Smart Ledger Management System</div>
          <div>A MERN stack project</div>
        </div>
      </footer>
    </div>
  );
};
