import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus } from 'lucide-react'
import { fetchKnowledgeBase } from '../../../db/dal'
import { Link } from '@tanstack/react-router'

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
        {kbs.length > 0 && <DropdownMenuLabel>My Sources</DropdownMenuLabel>}

        <DropdownMenuGroup>
          {kbs.length === 0 ? (
            <p className="text-center text-sm p-2">
              You don't have any sources
            </p>
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
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            asChild
            className="flex items-center justify-center"
          >
            <Link to={`/sources`}>
              Add <Plus />
            </Link>
          </DropdownMenuItem>
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
