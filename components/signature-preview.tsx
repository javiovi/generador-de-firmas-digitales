import type { SignatureData } from "@/components/signature-generator"
import { Facebook, Instagram, Youtube, Linkedin, Twitter, Phone, Mail, Globe, MapPin } from "lucide-react"
import { TemplateType, getTemplateById } from "@/lib/templates"

export default function SignaturePreview({ data }: { data: SignatureData }) {
  const template = getTemplateById(data.templateId || TemplateType.CLASSIC)

  // Filtrar redes sociales habilitadas
  const enabledSocialNetworks = Object.entries(data.socialLinks)
    .filter(([_, networkData]) => networkData.enabled)
    .map(([network, networkData]) => ({ network, url: networkData.url }))

  // Renderizar la plantilla seleccionada
  switch (data.templateId) {
    case TemplateType.MODERN:
      return (
        <div className="border p-4 bg-white rounded-md max-w-full overflow-auto">
          <table cellPadding="0" cellSpacing="0" className="w-full">
            <tbody>
              <tr>
                <td className="align-top pr-4" style={{ width: "120px" }}>
                  <img
                    src={data.logoUrl || "/placeholder.svg"}
                    alt={data.company}
                    className="w-[100px] h-auto object-contain"
                  />
                </td>
                <td className="align-top px-4 border-l-2 border-r-2" style={{ borderColor: data.primaryColor }}>
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-xl font-bold text-gray-800">{data.name}</h3>
                    <p className="text-sm font-semibold" style={{ color: data.primaryColor }}>
                      {data.position}
                    </p>

                    <div className="pt-2 text-sm text-gray-600 flex items-start gap-2">
                      <MapPin size={16} className="shrink-0 mt-0.5" />
                      <span>{data.address}</span>
                    </div>

                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone size={16} className="shrink-0" />
                      <span>{data.phone}</span>
                    </div>

                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Mail size={16} className="shrink-0" />
                      <span>{data.email}</span>
                    </div>

                    <div className="text-sm flex items-center gap-2" style={{ color: data.primaryColor }}>
                      <Globe size={16} className="shrink-0" />
                      <span>{data.website}</span>
                    </div>

                    {enabledSocialNetworks.length > 0 && (
                      <div className="flex items-center gap-3 pt-2">
                        {enabledSocialNetworks.map(({ network, url }) => {
                          let Icon
                          switch (network) {
                            case "facebook":
                              Icon = Facebook
                              break
                            case "instagram":
                              Icon = Instagram
                              break
                            case "youtube":
                              Icon = Youtube
                              break
                            case "linkedin":
                              Icon = Linkedin
                              break
                            case "twitter":
                              Icon = Twitter
                              break
                            default:
                              return null
                          }
                          return (
                            <a
                              key={network}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Icon size={20} />
                            </a>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </td>
                <td className="align-top pl-4" style={{ width: "120px" }}>
                  <div
                    className="w-[120px] h-[120px] rounded-full overflow-hidden border-2"
                    style={{ borderColor: data.primaryColor }}
                  >
                    <img
                      src={data.photoUrl || "/placeholder.svg"}
                      alt={data.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )

    case TemplateType.MINIMAL:
      return (
        <div className="border p-4 bg-white rounded-md max-w-full overflow-auto">
          <table cellPadding="0" cellSpacing="0" className="w-full">
            <tbody>
              <tr>
                <td className="align-top pr-4" style={{ width: "100px" }}>
                  <img
                    src={data.logoUrl || "/placeholder.svg"}
                    alt={data.company}
                    className="w-[80px] h-auto object-contain"
                  />
                </td>
                <td className="align-top">
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-lg font-bold text-gray-800">{data.name}</h3>
                    <p className="text-sm" style={{ color: data.primaryColor }}>
                      {data.position}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-600 pt-1">
                      <div className="flex items-center gap-1">
                        <Phone size={14} className="shrink-0" />
                        <span>{data.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Mail size={14} className="shrink-0" />
                        <span>{data.email}</span>
                      </div>
                      <div className="flex items-center gap-1" style={{ color: data.primaryColor }}>
                        <Globe size={14} className="shrink-0" />
                        <span>{data.website}</span>
                      </div>
                    </div>

                    {enabledSocialNetworks.length > 0 && (
                      <div className="flex items-center gap-2 pt-1">
                        {enabledSocialNetworks.map(({ network, url }) => {
                          let Icon
                          switch (network) {
                            case "facebook":
                              Icon = Facebook
                              break
                            case "instagram":
                              Icon = Instagram
                              break
                            case "youtube":
                              Icon = Youtube
                              break
                            case "linkedin":
                              Icon = Linkedin
                              break
                            case "twitter":
                              Icon = Twitter
                              break
                            default:
                              return null
                          }
                          return (
                            <a
                              key={network}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Icon size={16} />
                            </a>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )

    case TemplateType.CORPORATE:
      return (
        <div className="border p-4 bg-white rounded-md max-w-full overflow-auto">
          <table
            cellPadding="0"
            cellSpacing="0"
            className="w-full"
            style={{ border: template.showBorder ? `1px solid ${data.primaryColor}` : "none" }}
          >
            <tbody>
              <tr>
                <td colSpan={2} className="text-center p-3" style={{ backgroundColor: data.primaryColor }}>
                  <img
                    src={data.logoUrl || "/placeholder.svg"}
                    alt={data.company}
                    className="h-[40px] object-contain inline-block"
                  />
                </td>
              </tr>
              <tr>
                <td className="align-top p-4" style={{ width: "150px" }}>
                  <img
                    src={data.photoUrl || "/placeholder.svg"}
                    alt={data.name}
                    className="w-[120px] h-[120px] object-cover"
                  />
                </td>
                <td className="align-top p-4">
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-xl font-bold text-gray-800">{data.name}</h3>
                    <p className="text-sm font-semibold" style={{ color: data.primaryColor }}>
                      {data.position}
                    </p>
                    <div className="w-12 h-0.5 mb-1" style={{ backgroundColor: data.primaryColor }}></div>

                    <div className="text-sm text-gray-600">
                      <div className="font-medium">{data.company}</div>
                      <div>{data.address}</div>
                    </div>

                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone size={16} className="shrink-0" />
                      <span>{data.phone}</span>
                    </div>

                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Mail size={16} className="shrink-0" />
                      <span>{data.email}</span>
                    </div>

                    <div className="text-sm flex items-center gap-2" style={{ color: data.primaryColor }}>
                      <Globe size={16} className="shrink-0" />
                      <span>{data.website}</span>
                    </div>

                    {enabledSocialNetworks.length > 0 && (
                      <div className="flex items-center gap-3 pt-2">
                        {enabledSocialNetworks.map(({ network, url }) => {
                          let Icon
                          switch (network) {
                            case "facebook":
                              Icon = Facebook
                              break
                            case "instagram":
                              Icon = Instagram
                              break
                            case "youtube":
                              Icon = Youtube
                              break
                            case "linkedin":
                              Icon = Linkedin
                              break
                            case "twitter":
                              Icon = Twitter
                              break
                            default:
                              return null
                          }
                          return (
                            <a
                              key={network}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Icon size={20} />
                            </a>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )

    default: // CLASSIC
      return (
        <div className="border p-4 bg-white rounded-md max-w-full overflow-auto">
          <table cellPadding="0" cellSpacing="0" className="w-full">
            <tbody>
              <tr>
                <td className="align-top pr-4" style={{ width: "150px" }}>
                  <div className="flex flex-col items-center space-y-3">
                    <img
                      src={data.logoUrl || "/placeholder.svg"}
                      alt={data.company}
                      className="w-[120px] h-auto object-contain"
                    />
                    <div
                      className="w-[120px] h-[120px] rounded-full overflow-hidden border-2"
                      style={{ borderColor: data.primaryColor }}
                    >
                      <img
                        src={data.photoUrl || "/placeholder.svg"}
                        alt={data.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </td>
                <td className="align-top pl-4 border-l-2" style={{ borderColor: data.primaryColor }}>
                  <div className="flex flex-col space-y-2">
                    <h3 className="text-xl font-bold text-gray-800">{data.name}</h3>
                    <p
                      className="text-sm font-semibold uppercase pb-1 border-b-2"
                      style={{
                        color: data.primaryColor,
                        borderColor: data.primaryColor,
                      }}
                    >
                      {data.position}
                    </p>

                    <div className="pt-2 text-sm text-gray-600 flex items-start gap-2">
                      <MapPin size={16} className="shrink-0 mt-0.5" />
                      <span>{data.address}</span>
                    </div>

                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone size={16} className="shrink-0" />
                      <span>{data.phone}</span>
                    </div>

                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Mail size={16} className="shrink-0" />
                      <span>{data.email}</span>
                    </div>

                    <div className="text-sm flex items-center gap-2" style={{ color: data.primaryColor }}>
                      <Globe size={16} className="shrink-0" />
                      <span>{data.website}</span>
                    </div>

                    {enabledSocialNetworks.length > 0 && (
                      <div className="flex items-center gap-3 pt-2">
                        {enabledSocialNetworks.map(({ network, url }) => {
                          let Icon
                          switch (network) {
                            case "facebook":
                              Icon = Facebook
                              break
                            case "instagram":
                              Icon = Instagram
                              break
                            case "youtube":
                              Icon = Youtube
                              break
                            case "linkedin":
                              Icon = Linkedin
                              break
                            case "twitter":
                              Icon = Twitter
                              break
                            default:
                              return null
                          }
                          return (
                            <a
                              key={network}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Icon size={20} />
                            </a>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )
  }
}
