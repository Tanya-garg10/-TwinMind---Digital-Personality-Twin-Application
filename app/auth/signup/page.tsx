'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Demo: generate a userId and redirect to quiz
        const userId = 'user-' + Date.now();
        localStorage.setItem('userId', userId);
        router.push('/quiz');
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
                            <h1 className="text-3xl font-bold text-foreground mb-2">Create your twin</h1>
                            <p className="text-foreground-secondary">Start your personality analysis journey</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Your name"
                                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-foreground-secondary focus:outline-none focus:border-accent/50"
                                    required
                                />
                            </div>
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
                                    minLength={6}
                                />
                            </div>
                            <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                                Create Account & Start Quiz
                            </Button>
                        </form>

                        <p className="text-center text-foreground-secondary text-sm">
                            Already have an account?{' '}
                            <Link href="/auth/signin" className="text-accent hover:underline">Sign in</Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
