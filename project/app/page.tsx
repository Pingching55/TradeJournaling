import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Trade Journal</h1>
        <p className="text-gray-600 mb-8">Track and analyze your trading performance</p>
        <Link href="/auth/login">
          <Button size="lg">
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  );
}
