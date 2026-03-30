import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Bot, CheckCircle2, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type AuthMode = "login" | "signup"

type AuthShellProps = {
  mode: AuthMode
}

const MODE_CONTENT = {
  login: {
    eyebrow: "Acesso seguro",
    title: "Entrar na Veredicta",
    description:
      "Acesse o workspace jurídico com monitoramento processual, chatbot integrado e trilhas de análise em uma experiência centralizada.",
    primaryCta: "Entrar no painel",
    secondaryPrompt: "Ainda não tem conta?",
    secondaryLinkLabel: "Criar cadastro",
    secondaryHref: "/cadastro",
    footerNote: "Ao entrar, você acessa um ambiente protegido e rastreável para operação jurídica.",
  },
  signup: {
    eyebrow: "Novo acesso",
    title: "Criar conta",
    description:
      "Cadastre seu time para centralizar consultas, monitoramento judicial e rotinas estratégicas em um único ambiente.",
    primaryCta: "Criar conta",
    secondaryPrompt: "Já possui cadastro?",
    secondaryLinkLabel: "Fazer login",
    secondaryHref: "/login",
    footerNote: "O cadastro pode ser conectado depois ao provedor de autenticação da sua equipe.",
  },
} as const

const HIGHLIGHTS = [
  {
    icon: Bot,
    title: "Chatbot jurídico",
    description: "Pesquisa guiada com DataJud, cruzamento de tribunais e leitura orientada.",
  },
  {
    icon: ShieldCheck,
    title: "Ambiente confiável",
    description: "Visual consistente com trilha operacional, governança e contexto jurídico.",
  },
  {
    icon: Sparkles,
    title: "Fluxo unificado",
    description: "Dashboard, chatbot e automações em um mesmo workspace de trabalho.",
  },
]

export function AuthShell({ mode }: AuthShellProps) {
  const content = MODE_CONTENT[mode]
  const isSignup = mode === "signup"

  return (
    <div className="app-shell relative min-h-screen overflow-hidden text-foreground">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_28%,rgba(16,185,129,0.16),transparent_30%),radial-gradient(circle_at_82%_16%,rgba(16,185,129,0.08),transparent_24%),radial-gradient(circle_at_52%_100%,rgba(245,158,11,0.05),transparent_28%)]" />
        <div className="absolute inset-y-0 left-[12%] w-[36rem] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12),transparent_68%)] blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1020px]">
          <div className="mb-6 flex items-center justify-between gap-3">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-border/70 bg-background/65 text-muted-foreground hover:bg-background hover:text-foreground"
            >
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Voltar ao painel
              </Link>
            </Button>

            <div className="flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(74,222,128,0.7)]" />
              Workspace Veredicta
            </div>
          </div>

          <Card className="overflow-hidden border-border/60 bg-card/72 shadow-[0_28px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <CardContent className="grid gap-0 p-0 lg:grid-cols-[minmax(0,1.06fr)_420px]">
              <div className="relative overflow-hidden border-b border-border/60 p-8 lg:p-9 lg:border-b-0 lg:border-r">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/6 via-transparent to-transparent" />
                  <div className="absolute inset-y-8 left-0 w-40 bg-[radial-gradient(circle_at_left,rgba(16,185,129,0.12),transparent_72%)] blur-2xl" />
                  <div className="relative">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="absolute -inset-1.5 rounded-[1.4rem] bg-primary/20 blur-xl" />
                        <div className="relative flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-primary/15 bg-gradient-to-br from-primary/18 via-primary/8 to-transparent shadow-[0_18px_45px_rgba(16,185,129,0.18)]">
                          <Image
                            src="/iconveredicta.png"
                            alt="Veredicta"
                            width={34}
                            height={34}
                            className="h-8 w-8 object-contain"
                            priority
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Veredicta
                          </h1>
                          <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                            Legal Intelligence
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Plataforma de operação jurídica com análise, busca e automação.
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 space-y-4">
                      <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/55 px-3 py-1 text-xs font-medium text-muted-foreground">
                        <LockKeyhole className="h-3.5 w-3.5 text-primary" />
                        {content.eyebrow}
                      </div>
                      <div>
                        <h2 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground">
                          {content.title}
                        </h2>
                        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                          {content.description}
                        </p>
                      </div>
                    </div>

                    <div className="mt-8 grid gap-3 md:grid-cols-2">
                      {HIGHLIGHTS.map((item, index) => {
                        const Icon = item.icon
                        return (
                          <div
                            key={item.title}
                            className={`rounded-2xl border border-border/60 bg-background/45 p-4 ${
                              index === 2 ? "md:col-span-2" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                                <Icon className="h-4 w-4" />
                              </div>
                              <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                  {item.title}
                                </h3>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

              <div className="flex p-8 lg:items-center lg:p-9">
                <div className="mx-auto w-full max-w-[420px]">
                  <div className="mb-6">
                    <h3 className="text-2xl font-semibold text-foreground">
                      {isSignup ? "Cadastro da conta" : "Login da conta"}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {isSignup
                        ? "Preencha os dados iniciais para preparar o acesso da sua equipe."
                        : "Use seu e-mail corporativo para acessar o painel e o chatbot."}
                    </p>
                  </div>

                  <form className="space-y-5">
                    {isSignup && (
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="first-name">Nome</Label>
                          <Input id="first-name" placeholder="Manoela" className="h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last-name">Sobrenome</Label>
                          <Input id="last-name" placeholder="Stanley" className="h-11" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor={`${mode}-email`}>E-mail</Label>
                      <Input
                        id={`${mode}-email`}
                        type="email"
                        placeholder="voce@empresa.com.br"
                        className="h-11"
                      />
                    </div>

                    {isSignup && (
                      <div className="space-y-2">
                        <Label htmlFor="company">Empresa ou escritório</Label>
                        <Input id="company" placeholder="Veredicta Legal Ops" className="h-11" />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor={`${mode}-password`}>Senha</Label>
                      <Input
                        id={`${mode}-password`}
                        type="password"
                        placeholder="Digite sua senha"
                        className="h-11"
                      />
                    </div>

                    {isSignup && (
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar senha</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Repita sua senha"
                          className="h-11"
                        />
                      </div>
                    )}

                    <div className="rounded-2xl border border-border/60 bg-background/45 p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                        <p className="text-sm leading-6 text-muted-foreground">
                          {content.footerNote}
                        </p>
                      </div>
                    </div>

                    <Button
                      asChild
                      className="h-11 w-full rounded-full text-sm font-semibold"
                    >
                      <Link href="/">
                        {content.primaryCta}
                      </Link>
                    </Button>
                  </form>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      {content.secondaryPrompt}
                    </span>
                    <Link
                      href={content.secondaryHref}
                      className="font-semibold text-primary transition hover:text-primary/80"
                    >
                      {content.secondaryLinkLabel}
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
