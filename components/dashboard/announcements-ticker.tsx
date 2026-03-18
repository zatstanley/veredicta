"use client"

import {
  Sparkles,
  Zap,
  Database,
  AlertTriangle,
  ChartLine,
  Wand2,
} from "lucide-react"

const announcements = [
  {
    id: 1,
    text: "Modelo preditivo sinalizou 8 processos com risco de atraso nas próximas 48h.",
    type: "alert",
    icon: AlertTriangle,
  },
  {
    id: 2,
    text: "Nova automação: classificação de intimações por cluster de juízes (versão 2.1).",
    type: "automation",
    icon: Zap,
  },
  {
    id: 3,
    text: "Tempo médio de elaboração de peças caiu 12% após padronização de templates.",
    type: "performance",
    icon: ChartLine,
  },
  {
    id: 4,
    text: "Sincronização completa com e-SAJ e Eproc realizada às 14:30.",
    type: "data",
    icon: Database,
  },
  {
    id: 5,
    text: "Recomendação: reforçar squad Tributário para pico de prazos em 20/03.",
    type: "insight",
    icon: Wand2,
  },
]

const getTypeColor = (type: string) => {
  switch (type) {
    case "alert":
      return "text-urgent-high"
    case "automation":
      return "text-primary"
    case "performance":
      return "text-status-active"
    case "data":
      return "text-status-review"
    case "insight":
      return "text-accent"
    default:
      return "text-muted-foreground"
  }
}

export function AnnouncementsTicker() {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="flex items-center">
        <div className="flex shrink-0 items-center gap-3 border-r border-border bg-background/80 px-5 py-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="absolute -right-1 -top-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
              Insights
            </span>
            <span className="text-xs font-semibold text-foreground">
              Atualizações inteligentes
            </span>
          </div>
        </div>

        <div className="relative flex-1 overflow-hidden py-4">
          <div className="animate-marquee flex whitespace-nowrap">
            {[...announcements, ...announcements].map((announcement, index) => {
              const Icon = announcement.icon
              const colorClass = getTypeColor(announcement.type)

              return (
                <div
                  key={`${announcement.id}-${index}`}
                  className="inline-flex items-center px-8"
                >
                  <div
                    className={`mr-3 flex h-7 w-7 items-center justify-center rounded-lg bg-secondary ${colorClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-base font-medium text-foreground">
                    {announcement.text}
                  </span>
                  <Sparkles className="ml-8 h-4 w-4 text-border" />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 45s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}

