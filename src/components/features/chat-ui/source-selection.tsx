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

const SourceSelection = () => {
  return (
    <DropdownMenu>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>My Sources</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Keyboard shortcuts</DropdownMenuItem>
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
