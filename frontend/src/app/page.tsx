'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ApiError,
  createLease,
  fetchMyLeases,
  loginUser,
  registerUser,
} from '@/lib/api';
import { AuthUser, Lease } from '@/lib/types';

type AuthMode = 'login' | 'register';

const TOKEN_STORAGE_KEY = 'leasing_access_token';
const USER_STORAGE_KEY = 'leasing_user';

function statusClass(status: Lease['status']) {
  if (status === 'approved') {
    return 'bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-800/80';
  }
  if (status === 'rejected') {
    return 'bg-rose-950/40 text-rose-300 ring-1 ring-rose-800/80';
  }
  return 'bg-amber-900/30 text-amber-300 ring-1 ring-amber-700/70';
}

function formatCurrency(value: number | string) {
  const numeric = typeof value === 'string' ? Number(value) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number.isNaN(numeric) ? 0 : numeric);
}

function parseError(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unexpected error occurred.';
}

export default function Home() {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [token, setToken] = useState('');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [leases, setLeases] = useState<Lease[]>([]);

  const [assetName, setAssetName] = useState('');
  const [leaseAmount, setLeaseAmount] = useState('');
  const [termMonths, setTermMonths] = useState('12');
  const [startDate, setStartDate] = useState('');

  const [authLoading, setAuthLoading] = useState(false);
  const [leaseLoading, setLeaseLoading] = useState(false);
  const [loadingLeases, setLoadingLeases] = useState(false);

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initials = useMemo(() => {
    if (!user) {
      return 'NA';
    }
    return user.fullName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  const leaseMetrics = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    let totalAmount = 0;

    for (const lease of leases) {
      const numericAmount = Number(lease.leaseAmount);
      if (!Number.isNaN(numericAmount)) {
        totalAmount += numericAmount;
      }

      if (lease.status === 'pending') {
        pending += 1;
      } else if (lease.status === 'approved') {
        approved += 1;
      } else if (lease.status === 'rejected') {
        rejected += 1;
      }
    }

    return {
      pending,
      approved,
      rejected,
      totalAmount,
    };
  }, [leases]);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);

    if (!storedToken || !storedUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as AuthUser;
      setToken(storedToken);
      setUser(parsedUser);
    } catch {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setLeases([]);
      return;
    }

    void loadLeases(token);
  }, [token]);

  async function loadLeases(activeToken: string) {
    setLoadingLeases(true);
    setError(null);

    try {
      const fetchedLeases = await fetchMyLeases(activeToken);
      setLeases(fetchedLeases);
    } catch (loadError) {
      setError(parseError(loadError));
    } finally {
      setLoadingLeases(false);
    }
  }

  function saveSession(nextToken: string, nextUser: AuthUser) {
    setToken(nextToken);
    setUser(nextUser);
    window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  }

  function clearSession() {
    setToken('');
    setUser(null);
    setLeases([]);
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthLoading(true);
    setError(null);
    setMessage(null);

    try {
      const authResponse =
        authMode === 'register'
          ? await registerUser({ fullName, email, password })
          : await loginUser({ email, password });

      saveSession(authResponse.accessToken, authResponse.user);
      setMessage(
        authMode === 'register'
          ? 'Account created. You are now logged in.'
          : 'Welcome back. You are logged in.',
      );
      setPassword('');
    } catch (authError) {
      setError(parseError(authError));
    } finally {
      setAuthLoading(false);
    }
  }

  async function handleLeaseSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) {
      return;
    }

    setLeaseLoading(true);
    setError(null);
    setMessage(null);

    try {
      const newLease = await createLease(token, {
        assetName,
        leaseAmount: Number(leaseAmount),
        termMonths: Number(termMonths),
        startDate,
      });

      setLeases((current) => [newLease, ...current]);
      setAssetName('');
      setLeaseAmount('');
      setTermMonths('12');
      setStartDate('');
      setMessage('Lease request submitted successfully.');
    } catch (leaseError) {
      setError(parseError(leaseError));
    } finally {
      setLeaseLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-amber-900/40 bg-zinc-900/90 p-6 shadow-[0_18px_42px_-22px_rgba(0,0,0,0.9)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400 text-sm font-semibold text-zinc-950">
                  LR
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300/80">
                    Leasing Operations
                  </p>
                  <h1 className="text-2xl font-semibold tracking-tight text-zinc-100 sm:text-3xl">
                    Registration and Lease Workspace
                  </h1>
                </div>
              </div>

              <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-400">
                Centralize customer onboarding and lease approvals with a
                focused dark interface designed for daily operations.
              </p>
            </div>

            <div className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs text-zinc-400">
              {user ? (
                <>
                  Signed in as <span className="font-medium text-amber-300">{user.fullName}</span>
                </>
              ) : (
                <span>Session status: guest</span>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Pending</p>
              <p className="mt-1 text-xl font-semibold text-amber-300">{leaseMetrics.pending}</p>
            </div>
            <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Approved</p>
              <p className="mt-1 text-xl font-semibold text-zinc-100">{leaseMetrics.approved}</p>
            </div>
            <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Rejected</p>
              <p className="mt-1 text-xl font-semibold text-zinc-100">{leaseMetrics.rejected}</p>
            </div>
            <div className="rounded-lg border border-zinc-700 bg-zinc-950 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Requested Value
              </p>
              <p className="mt-1 text-xl font-semibold text-zinc-100">
                {formatCurrency(leaseMetrics.totalAmount)}
              </p>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[340px_1fr]">
          <aside className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.9)]">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-base font-semibold text-zinc-100">
                {user ? 'Signed In' : 'Account Access'}
              </h2>
              {!user ? (
                <div className="inline-flex rounded-lg border border-zinc-700 bg-zinc-950 p-1 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className={`rounded-md px-3 py-1.5 transition ${
                      authMode === 'login'
                        ? 'bg-amber-400 text-zinc-950'
                        : 'text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className={`rounded-md px-3 py-1.5 transition ${
                      authMode === 'register'
                        ? 'bg-amber-400 text-zinc-950'
                        : 'text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    Register
                  </button>
                </div>
              ) : null}
            </div>

            {!user ? (
              <form className="space-y-5" onSubmit={handleAuthSubmit}>
                {authMode === 'register' ? (
                  <label className="block text-sm font-medium text-zinc-300">
                    Full Name
                    <input
                      required
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                    />
                  </label>
                ) : null}

                <label className="block text-sm font-medium text-zinc-300">
                  Email
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  />
                </label>

                <label className="block text-sm font-medium text-zinc-300">
                  Password
                  <input
                    required
                    type="password"
                    minLength={6}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                  />
                </label>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {authLoading
                    ? 'Please wait...'
                    : authMode === 'register'
                      ? 'Create Account'
                      : 'Login'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-950 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-400 text-sm font-semibold text-zinc-950">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{user.fullName}</p>
                    <p className="text-xs text-zinc-400">{user.email}</p>
                    <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
                      Role: {user.role}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={clearSession}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-zinc-800"
                >
                  Logout
                </button>
              </div>
            )}
          </aside>

          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-[0_12px_30px_-20px_rgba(0,0,0,0.9)] md:p-6">
            {!user ? (
              <div className="flex min-h-60 items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-950 text-center text-sm text-zinc-400">
                <p className="max-w-sm px-6 leading-6">
                  Register or login to submit lease requests and monitor their
                  approval status.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-100">Create Lease Request</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    Provide lease details to submit a new request.
                  </p>
                </div>

                <form
                  className="grid gap-4 rounded-xl border border-zinc-700 bg-zinc-950 p-4 md:grid-cols-2 md:p-5"
                  onSubmit={handleLeaseSubmit}
                >
                  <label className="block text-sm font-medium text-zinc-300 md:col-span-2">
                    Asset Name
                    <input
                      required
                      value={assetName}
                      onChange={(event) => setAssetName(event.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                    />
                  </label>

                  <label className="block text-sm font-medium text-zinc-300">
                    Lease Amount (USD)
                    <input
                      required
                      type="number"
                      step="0.01"
                      min="1"
                      value={leaseAmount}
                      onChange={(event) => setLeaseAmount(event.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                    />
                  </label>

                  <label className="block text-sm font-medium text-zinc-300">
                    Term (Months)
                    <input
                      required
                      type="number"
                      min="1"
                      value={termMonths}
                      onChange={(event) => setTermMonths(event.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                    />
                  </label>

                  <label className="block text-sm font-medium text-zinc-300 md:col-span-2">
                    Start Date
                    <input
                      required
                      type="date"
                      value={startDate}
                      onChange={(event) => setStartDate(event.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={leaseLoading}
                    className="md:col-span-2 rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {leaseLoading ? 'Submitting...' : 'Submit Lease Request'}
                  </button>
                </form>

                <div>
                  <h3 className="text-base font-semibold text-zinc-100">My Lease Requests</h3>
                  {loadingLeases ? (
                    <p className="mt-3 text-sm text-zinc-400">Loading leases...</p>
                  ) : leases.length === 0 ? (
                    <p className="mt-3 text-sm text-zinc-400">No leases submitted yet.</p>
                  ) : (
                    <div className="mt-3 overflow-hidden rounded-xl border border-zinc-700">
                      <table className="min-w-full divide-y divide-zinc-700 text-sm">
                        <thead className="bg-zinc-950 text-left text-xs font-semibold uppercase tracking-wide text-zinc-400">
                          <tr>
                            <th className="px-4 py-3">Asset</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Term</th>
                            <th className="px-4 py-3">Start</th>
                            <th className="px-4 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800 bg-zinc-900">
                          {leases.map((lease) => (
                            <tr key={lease.id} className="transition hover:bg-zinc-800/70">
                              <td className="px-4 py-3 font-medium text-zinc-100">
                                {lease.assetName}
                              </td>
                              <td className="px-4 py-3 text-zinc-300">
                                {formatCurrency(lease.leaseAmount)}
                              </td>
                              <td className="px-4 py-3 text-zinc-300">
                                {lease.termMonths} months
                              </td>
                              <td className="px-4 py-3 text-zinc-300">
                                {lease.startDate}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusClass(
                                    lease.status,
                                  )}`}
                                >
                                  {lease.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        {message ? (
          <p className="mt-6 rounded-lg border border-emerald-800/70 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="mt-6 rounded-lg border border-rose-800/70 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
