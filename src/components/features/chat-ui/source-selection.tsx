import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus } from 'lucide-react'
import { fetchKnowledgeBase } from '../../../db/dal'

type KBS = Awaited<ReturnType<typeof fetchKnowledgeBase>>

type SourceSelectionProps = {
  kbs: KBS
  handleKnowledgeChange: (kb: KBS[number]) => void
}

const SourceSelection = ({
  kbs,
  handleKnowledgeChange,
}: SourceSelectionProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>My Sources</DropdownMenuLabel>
        <DropdownMenuGroup>
          {kbs.length === 0 ? (
            <div>Please add knowledgebases</div>
          ) : (
            kbs.map((kb) => (
              <DropdownMenuItem
                onSelect={() => handleKnowledgeChange(kb)}
                key={kb.id}
              >
                {kb.name}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
      <DropdownMenuTrigger asChild>
        <Button className="h-full" variant="default" size={`icon`}>
          <Plus />
        </Button>
      </DropdownMenuTrigger>
    </DropdownMenu>
  )
}

export { SourceSelection }
