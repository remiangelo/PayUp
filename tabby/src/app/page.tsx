import { CreateTabForm } from '@/components/create-tab-form'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tabby
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            The social IOU tracker for friend groups
          </p>
          <p className="text-sm text-muted-foreground">
            Split expenses. Track balances. Settle up with style.
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <CreateTabForm />
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 px-4">
          <div className="text-center">
            <div className="text-3xl mb-3">📝</div>
            <h3 className="font-semibold mb-2">Track IOUs</h3>
            <p className="text-sm text-muted-foreground">
              Add expenses and split them evenly or custom amounts
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">⚖️</div>
            <h3 className="font-semibold mb-2">Smart Balances</h3>
            <p className="text-sm text-muted-foreground">
              See who owes who with optimized settlement paths
            </p>
          </div>
          <div className="text-center">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold mb-2">AI Reminders</h3>
            <p className="text-sm text-muted-foreground">
              Generate playful nudges to settle up with friends
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}