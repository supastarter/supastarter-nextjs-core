import { Greeting } from "@/components/greeting";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            <h1>supastarter</h1>
          </CardTitle>
          <CardDescription>
            Edit <code className="font-mono">apps/web/src/app/page.tsx</code> to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Greeting />
        </CardContent>
      </Card>
    </main>
  );
}
