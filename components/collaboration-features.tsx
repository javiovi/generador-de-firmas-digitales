"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ShareSignature from "@/components/share-signature"
import TeamCollaboration from "@/components/team-collaboration"
import CompatibilityChecker from "@/components/compatibility-checker"
import type { SignatureData } from "@/components/signature-generator"

interface CollaborationFeaturesProps {
  signatureData: SignatureData
  signatureId?: string
  signatureName: string
  htmlCode: string
}

export default function CollaborationFeatures({
  signatureData,
  signatureId,
  signatureName,
  htmlCode,
}: CollaborationFeaturesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Funcionalidades colaborativas</CardTitle>
        <CardDescription>Comparte, colabora y verifica la compatibilidad de tu firma de correo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ShareSignature signatureData={signatureData} signatureId={signatureId} signatureName={signatureName} />
          <TeamCollaboration />
        </div>

        <CompatibilityChecker signatureData={signatureData} htmlCode={htmlCode} />
      </CardContent>
    </Card>
  )
}
