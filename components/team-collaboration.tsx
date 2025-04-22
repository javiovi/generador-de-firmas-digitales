"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Users, User, UserPlus, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"

interface TeamMember {
  id: string
  name: string
  email: string
  role: "editor" | "viewer"
  avatar?: string
}

export default function TeamCollaboration() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Ana Rodríguez",
      email: "ana@empresa.com",
      role: "editor",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "2",
      name: "Carlos Martínez",
      email: "carlos@empresa.com",
      role: "viewer",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ])

  const handleAddMember = () => {
    if (!newMemberEmail) {
      toast({
        title: "Correo requerido",
        description: "Por favor, ingresa un correo electrónico",
        variant: "destructive",
      })
      return
    }

    // Simulación de invitación de miembro (en una implementación real, se haría una llamada a la API)
    const randomId = Math.random().toString(36).substring(2, 9)
    const newMember: TeamMember = {
      id: randomId,
      name: newMemberEmail.split("@")[0],
      email: newMemberEmail,
      role: "viewer",
    }

    setMembers([...members, newMember])
    setNewMemberEmail("")

    toast({
      title: "Miembro invitado",
      description: `Se ha enviado una invitación a ${newMemberEmail}`,
    })
  }

  const handleRoleChange = (id: string, role: "editor" | "viewer") => {
    setMembers(members.map((member) => (member.id === id ? { ...member, role } : member)))

    toast({
      title: "Rol actualizado",
      description: `El rol del miembro ha sido actualizado correctamente`,
    })
  }

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter((member) => member.id !== id))

    toast({
      title: "Miembro eliminado",
      description: "El miembro ha sido eliminado del equipo",
    })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full flex items-center gap-2">
          <Users size={16} />
          Colaboración en Equipo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gestión de equipo</DialogTitle>
          <DialogDescription>Invita a miembros de tu equipo para colaborar en las firmas.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-end gap-2">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                placeholder="nombre@empresa.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
              />
            </div>
            <Button onClick={handleAddMember} className="flex items-center gap-1">
              <UserPlus size={16} />
              Invitar
            </Button>
          </div>

          <div className="border rounded-md">
            <div className="p-3 bg-muted/50 border-b flex justify-between items-center">
              <h3 className="font-medium text-sm">Miembros del Equipo</h3>
              <span className="text-xs text-muted-foreground">Total: {members.length}</span>
            </div>

            <div className="divide-y">
              {members.map((member) => (
                <div key={member.id} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <Switch
                        id={`role-${member.id}`}
                        checked={member.role === "editor"}
                        onCheckedChange={(checked) => handleRoleChange(member.id, checked ? "editor" : "viewer")}
                      />
                      <Label htmlFor={`role-${member.id}`} className="text-xs">
                        {member.role === "editor" ? "Editor" : "Visor"}
                      </Label>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveMember(member.id)}
                      title="Eliminar miembro"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}

              {members.length === 0 && (
                <div className="p-6 text-center text-muted-foreground">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No hay miembros en el equipo</p>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            <strong>Editor:</strong> Puede crear, editar y eliminar firmas.
            <br />
            <strong>Visor:</strong> Solo puede ver y usar las firmas existentes.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
