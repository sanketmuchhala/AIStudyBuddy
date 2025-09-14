'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Eye,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
  Minus,
  X,
  Brain
} from 'lucide-react'
import { useFlashcardShortcuts } from '@/lib/keyboard-shortcuts'
import { toast } from 'sonner'

interface Flashcard {
  id: string
  front: string
  back: string
  category: string
  difficulty: number
  interval: number
  repetitions: number
  easeFactor: number
  nextReviewDate: string
  lastReviewedAt?: string
}

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isReviewing, setIsReviewing] = useState(false)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [newCardFront, setNewCardFront] = useState('')
  const [newCardBack, setNewCardBack] = useState('')
  const [newCardCategory, setNewCardCategory] = useState('')
  const [loading, setLoading] = useState(true)

  // Add keyboard shortcuts for flashcard review
  useFlashcardShortcuts(
    () => isReviewing && showAnswer && reviewCard(1), // Again
    () => isReviewing && showAnswer && reviewCard(2), // Hard  
    () => isReviewing && showAnswer && reviewCard(3), // Good
    () => isReviewing && showAnswer && reviewCard(4), // Easy
    () => isReviewing && flipCard() // Flip card
  )

  useEffect(() => {
    fetchFlashcards()
  }, [])

  const fetchFlashcards = async () => {
    try {
      const response = await fetch('/api/flashcards')
      if (!response.ok) throw new Error('Failed to fetch flashcards')
      
      const cards = await response.json()
      setFlashcards(cards)
      
      // Filter cards due for review
      const dueCards = cards.filter((card: Flashcard) => 
        new Date(card.nextReviewDate) <= new Date()
      )
      
      if (dueCards.length > 0) {
        setFlashcards(dueCards)
      }
    } catch (error) {
      console.error('Error fetching flashcards:', error)
      toast.error('Failed to load flashcards')
    } finally {
      setLoading(false)
    }
  }

  const createFlashcard = async () => {
    if (!newCardFront.trim() || !newCardBack.trim()) {
      toast.error('Please fill in both front and back text')
      return
    }

    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          front: newCardFront,
          back: newCardBack,
          category: newCardCategory || 'General'
        })
      })

      if (!response.ok) throw new Error('Failed to create flashcard')

      const newCard = await response.json()
      setFlashcards(prev => [newCard, ...prev])
      
      // Reset form
      setNewCardFront('')
      setNewCardBack('')
      setNewCardCategory('')
      
      toast.success('Flashcard created successfully!')
    } catch (error) {
      console.error('Error creating flashcard:', error)
      toast.error('Failed to create flashcard')
    }
  }

  const reviewCard = async (quality: number) => {
    if (currentCardIndex >= flashcards.length) return

    const currentCard = flashcards[currentCardIndex]

    try {
      const response = await fetch('/api/flashcards/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          flashcardId: currentCard.id,
          quality
        })
      })

      if (!response.ok) throw new Error('Failed to review flashcard')

      const updatedCard = await response.json()
      
      // Update the card in our local state
      setFlashcards(prev => 
        prev.map(card => card.id === updatedCard.id ? updatedCard : card)
      )

      // Move to next card
      setReviewedCount(prev => prev + 1)
      setShowAnswer(false)
      
      if (currentCardIndex < flashcards.length - 1) {
        setCurrentCardIndex(prev => prev + 1)
      } else {
        // Review session complete
        setIsReviewing(false)
        toast.success(`Review session complete! You reviewed ${reviewedCount + 1} cards.`)
        fetchFlashcards() // Refresh to get updated due dates
      }
    } catch (error) {
      console.error('Error reviewing flashcard:', error)
      toast.error('Failed to save review')
    }
  }

  const startReview = () => {
    const dueCards = flashcards.filter(card => 
      new Date(card.nextReviewDate) <= new Date()
    )
    
    if (dueCards.length === 0) {
      toast.info('No cards are due for review right now!')
      return
    }
    
    setFlashcards(dueCards)
    setCurrentCardIndex(0)
    setShowAnswer(false)
    setIsReviewing(true)
    setReviewedCount(0)
  }

  const flipCard = () => {
    setShowAnswer(!showAnswer)
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 1) return 'bg-green-500'
    if (difficulty <= 3) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 1) return 'Easy'
    if (difficulty <= 3) return 'Medium'
    return 'Hard'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flashcards</h1>
          <p className="text-muted-foreground">Loading your flashcards...</p>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  const currentCard = flashcards[currentCardIndex]
  const dueCards = flashcards.filter(card => new Date(card.nextReviewDate) <= new Date())

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Flashcards</h1>
        <p className="text-muted-foreground">
          Spaced repetition learning system to help you remember better
        </p>
      </div>

      <Tabs defaultValue="review" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
        </TabsList>

        <TabsContent value="review" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Due for Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dueCards.length}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Total Cards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{flashcards.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Reviewed Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reviewedCount}</div>
              </CardContent>
            </Card>
          </div>

          {!isReviewing ? (
            <Card className="text-center py-12">
              <CardContent>
                <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <CardTitle className="mb-2">Ready to Review?</CardTitle>
                <CardDescription className="mb-6">
                  {dueCards.length > 0 
                    ? `You have ${dueCards.length} cards ready for review`
                    : 'No cards are due for review right now. Great job staying on top of your studies!'
                  }
                </CardDescription>
                {dueCards.length > 0 && (
                  <Button onClick={startReview} size="lg">
                    Start Review Session
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : currentCard && (
            <div className="max-w-2xl mx-auto">
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Card {currentCardIndex + 1} of {flashcards.length}
                  </p>
                  <Progress 
                    value={((currentCardIndex + 1) / flashcards.length) * 100} 
                    className="w-64"
                  />
                </div>
                <Badge variant="outline">{currentCard.category}</Badge>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={showAnswer ? 'back' : 'front'}
                  initial={{ opacity: 0, rotateY: -90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: 90 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className="min-h-[300px] cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={flipCard}
                  >
                    <CardContent className="flex items-center justify-center p-8 text-center">
                      <div>
                        <div className="mb-4">
                          <Badge className={`${getDifficultyColor(currentCard.difficulty)} text-white`}>
                            {getDifficultyLabel(currentCard.difficulty)}
                          </Badge>
                        </div>
                        <div className="text-lg mb-4">
                          {showAnswer ? currentCard.back : currentCard.front}
                        </div>
                        <div className="flex items-center justify-center text-muted-foreground">
                          {showAnswer ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                          <span className="text-sm">
                            Click to {showAnswer ? 'hide' : 'show'} answer
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>

              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex justify-center space-x-4"
                >
                  <Button
                    onClick={() => reviewCard(1)}
                    variant="destructive"
                    className="flex-1 max-w-32"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Again (1)
                  </Button>
                  <Button
                    onClick={() => reviewCard(2)}
                    variant="outline"
                    className="flex-1 max-w-32"
                  >
                    <Minus className="h-4 w-4 mr-2" />
                    Hard (2)
                  </Button>
                  <Button
                    onClick={() => reviewCard(3)}
                    variant="outline"
                    className="flex-1 max-w-32"
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Good (3)
                  </Button>
                  <Button
                    onClick={() => reviewCard(4)}
                    className="flex-1 max-w-32"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Easy (4)
                  </Button>
                </motion.div>
              )}

              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Use keyboard shortcuts: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Flashcard</CardTitle>
              <CardDescription>
                Add a new flashcard to your collection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="front">Front (Question)</Label>
                <Textarea
                  id="front"
                  placeholder="Enter the question or prompt..."
                  value={newCardFront}
                  onChange={(e) => setNewCardFront(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="back">Back (Answer)</Label>
                <Textarea
                  id="back"
                  placeholder="Enter the answer or explanation..."
                  value={newCardBack}
                  onChange={(e) => setNewCardBack(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category (optional)</Label>
                <Input
                  id="category"
                  placeholder="e.g. JavaScript, Math, History..."
                  value={newCardCategory}
                  onChange={(e) => setNewCardCategory(e.target.value)}
                />
              </div>

              <Button onClick={createFlashcard} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Create Flashcard
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flashcards.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-48 relative">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline">{card.category}</Badge>
                      <Badge className={`${getDifficultyColor(card.difficulty)} text-white text-xs`}>
                        {getDifficultyLabel(card.difficulty)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm mb-2 font-medium line-clamp-2">
                      {card.front}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-3">
                      {card.back}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="text-xs text-muted-foreground">
                        Next: {new Date(card.nextReviewDate).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {flashcards.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <Plus className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <CardTitle className="mb-2">No Flashcards Yet</CardTitle>
                <CardDescription className="mb-6">
                  Create your first flashcard to start learning with spaced repetition
                </CardDescription>
                <Button onClick={() => (document.querySelector('[value="create"]') as HTMLElement)?.click()}>
                  Create Your First Card
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}