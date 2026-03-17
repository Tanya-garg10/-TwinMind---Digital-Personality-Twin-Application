'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Demo: just redirect to quiz/dashboard
        const existing = localStorage.getItem('personalityAnalysis');
        router.push(existing ? '/dashboard' : '/quiz');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary flex flex-col">
            <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    TwinMind
                </Link>
            </nav>

            <main className="flex-1 flex items-center justify-center px-6">
                <div className="w-full max-w-md">
                    <div className="bg-card border border-border rounded-lg p-8 space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
                            <p className="text-foreground-secondary">Sign in to your TwinMind account</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-foreground-secondary focus:outline-none focus:border-accent/50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-foreground-secondary focus:outline-none focus:border-accent/50"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                                Sign In
                            </Button>
                        </form>

                        <p className="text-center text-foreground-secondary text-sm">
                            Don't have an account?{' '}
                            <Link href="/auth/signup" className="text-accent hover:underline">Sign up</Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
