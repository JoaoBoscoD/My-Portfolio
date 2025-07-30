"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Clock, Wifi, Battery } from "lucide-react"
import { cn } from "@/lib/utils"

interface WindowState {
  id: string
  isOpen: boolean
  isMinimized: boolean
  position: { x: number; y: number }
  zIndex: number
}

interface DockItem {
  id: string
  name: string
  icon: string
  color: string
}

const dockItems: DockItem[] = [
  { id: "about", name: "Sobre Mim", icon: "👤", color: "bg-blue-500" },
  { id: "experience", name: "Experiências", icon: "💼", color: "bg-yellow-500" },
  { id: "skills", name: "Skills", icon: "⚡", color: "bg-black" },
  { id: "projects", name: "Projetos", icon: "🛠️", color: "bg-purple-500" },
  { id: "contact", name: "Contato", icon: "📬", color: "bg-red-500" },
]

export default function MacOSPortfolio() {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [highestZIndex, setHighestZIndex] = useState(1000)
  const [isDragging, setIsDragging] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const openWindow = (id: string) => {
    const existingWindow = windows.find((w) => w.id === id)
    if (existingWindow) {
      if (existingWindow.isMinimized) {
        setWindows((prev) =>
          prev.map((w) => (w.id === id ? { ...w, isMinimized: false, zIndex: highestZIndex + 1 } : w)),
        )
        setHighestZIndex((prev) => prev + 1)
      } else {
        setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: highestZIndex + 1 } : w)))
        setHighestZIndex((prev) => prev + 1)
      }
    } else {
      const newWindow: WindowState = {
        id,
        isOpen: true,
        isMinimized: false,
        position: { x: 100 + windows.length * 30, y: 100 + windows.length * 30 },
        zIndex: highestZIndex + 1,
      }
      setWindows((prev) => [...prev, newWindow])
      setHighestZIndex((prev) => prev + 1)
    }
  }

  const closeWindow = (id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id))
  }

  const minimizeWindow = (id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)))
  }

  const handleMouseDown = (e: React.MouseEvent, windowId: string) => {
    const window = windows.find((w) => w.id === windowId)
    if (!window) return

    setIsDragging(windowId)
    setDragOffset({
      x: e.clientX - window.position.x,
      y: e.clientY - window.position.y,
    })

    // Bring window to front
    setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, zIndex: highestZIndex + 1 } : w)))
    setHighestZIndex((prev) => prev + 1)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    setWindows((prev) =>
      prev.map((w) =>
        w.id === isDragging
          ? {
              ...w,
              position: {
                x: e.clientX - dragOffset.x,
                y: e.clientY - dragOffset.y,
              },
            }
          : w,
      ),
    )
  }

  const handleMouseUp = () => {
    setIsDragging(null)
  }

  return (
    <div
      className="h-screen w-full overflow-hidden relative"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        backgroundImage: `url('/macos-wallpaper.png')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Menu Bar */}
      <div className="h-6 bg-gray-800/90 backdrop-blur-md border-b border-gray-700/50 flex items-center justify-between px-4 text-sm">
        <div className="flex items-center space-x-4">
          <div className="text-gray-200">João Bosco - Portfolio</div>
        </div>
        <div className="flex items-center space-x-2 text-gray-200">
          <Wifi className="w-4 h-4" />
          <Battery className="w-4 h-4" />
          <Clock className="w-4 h-4" />
          <span className="font-mono text-xs">
            {currentTime.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Desktop */}
      <div className="flex-1 relative">
        {/* Windows */}
        {windows.map((window) => (
          <Window
            key={window.id}
            window={window}
            onClose={closeWindow}
            onMinimize={minimizeWindow}
            onMouseDown={handleMouseDown}
            isDragging={isDragging === window.id}
          />
        ))}
      </div>

      {/* Dock */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div className="bg-gray-800/30 backdrop-blur-md rounded-2xl p-2 border border-gray-600/30 shadow-2xl">
          <div className="flex items-center space-x-1">
            {dockItems.map((item) => (
              <button
                key={item.id}
                onClick={() => openWindow(item.id)}
                className="group relative w-14 h-14 rounded-xl bg-gray-700/20 backdrop-blur-sm border border-gray-600/20 hover:bg-gray-600/30 transition-all duration-200 hover:scale-110 hover:-translate-y-1 flex items-center justify-center text-2xl shadow-lg"
                title={item.name}
              >
                <span className="group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface WindowProps {
  window: WindowState
  onClose: (id: string) => void
  onMinimize: (id: string) => void
  onMouseDown: (e: React.MouseEvent, id: string) => void
  isDragging: boolean
}

function Window({ window, onClose, onMinimize, onMouseDown, isDragging }: WindowProps) {
  if (window.isMinimized) return null

  const getWindowContent = () => {
    switch (window.id) {
      case "about":
        return <AboutWindow />
      case "experience":
        return <ExperienceWindow />
      case "skills":
        return <SkillsWindow />
      case "projects":
        return <ProjectsWindow />
      case "contact":
        return <ContactWindow />
      default:
        return <div>Conteúdo não encontrado</div>
    }
  }

  const getWindowTitle = () => {
    const titles = {
      about: "Sobre Mim",
      experience: "Experiências",
      skills: "Terminal",
      projects: "Projetos",
      contact: "Contato",
    }
    return titles[window.id as keyof typeof titles] || "Janela"
  }

  return (
    <div
      className={cn(
        "absolute bg-gray-800 rounded-lg shadow-2xl border border-gray-700/50 overflow-hidden transition-all duration-300",
        isDragging ? "cursor-grabbing" : "cursor-default",
      )}
      style={{
        left: window.position.x,
        top: window.position.y,
        zIndex: window.zIndex,
        width: window.id === "skills" ? "600px" : "500px",
        height: window.id === "skills" ? "400px" : "600px",
      }}
    >
      {/* Title Bar */}
      <div
        className="h-8 bg-gray-700 border-b border-gray-600/50 flex items-center justify-between px-4 cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => onMouseDown(e, window.id)}
      >
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onClose(window.id)}
            className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors duration-150"
          />
          <button
            onClick={() => onMinimize(window.id)}
            className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors duration-150"
          />
          <button className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors duration-150" />
        </div>
        <div className="text-sm font-medium text-gray-200 absolute left-1/2 transform -translate-x-1/2">
          {getWindowTitle()}
        </div>
        <div />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">{getWindowContent()}</div>
    </div>
  )
}

function AboutWindow() {
  return (
    <div className="p-6 h-full bg-gray-800">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl text-white font-bold shadow-lg">
          JB
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">João Bosco</h1>
          <p className="text-lg text-blue-400 mb-4">Desenvolvedor de Software Sênior</p>
          <p className="text-gray-300 leading-relaxed max-w-md">
            Sou desenvolvedor sênior com 7+ anos de experiência em microsserviços, APIs e soluções escaláveis.
            Apaixonado por tecnologia, boas práticas e mentoria de times.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
          <div className="text-center">
            <div className="font-semibold text-gray-200">29 anos</div>
            <div>Idade</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-200">7+ anos</div>
            <div>Experiência</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ExperienceWindow() {
  const experiences = [
    {
      company: "MetaBank",
      period: "2022 - Atual",
      role: "Senior Software Developer",
      description: "Desenvolvimento de microsserviços e APIs escaláveis",
      icon: "🏦",
    },
    {
      company: "Localiza",
      period: "2019 - 2022",
      role: "Software Developer",
      description: "Soluções para gestão de frotas e locação",
      icon: "🚗",
    },
    {
      company: "Walmart",
      period: "2018 - 2019",
      role: "Junior Developer",
      description: "Sistemas de e-commerce e logística",
      icon: "🛒",
    },
  ]

  return (
    <div className="p-6 h-full bg-gray-800">
      <h2 className="text-xl font-bold text-gray-100 mb-6">Experiência Profissional</h2>
      <div className="space-y-4">
        {experiences.map((exp, index) => (
          <div
            key={index}
            className="bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-600 hover:shadow-md hover:bg-gray-600/50 transition-all duration-200"
          >
            <div className="flex items-start space-x-4">
              <div className="text-2xl">{exp.icon}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-100">{exp.company}</h3>
                  <span className="text-sm text-gray-300 bg-gray-600 px-2 py-1 rounded">{exp.period}</span>
                </div>
                <p className="text-blue-400 font-medium mb-2">{exp.role}</p>
                <p className="text-gray-300 text-sm">{exp.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SkillsWindow() {
  const [displayedText, setDisplayedText] = useState("")
  const [currentLine, setCurrentLine] = useState(0)

  const terminalLines = [
    "$ whoami",
    "joao-bosco",
    "",
    "$ skills --list",
    "Languages: Java, .NET, Node.js, TypeScript",
    "Databases: SQL, MongoDB, NoSQL, Redis",
    "DevOps: Docker, CI/CD, Kubernetes",
    "Architecture: Microsserviços, Cloud, APIs REST",
    "Practices: TDD, Clean Code, Agile, Mentoria",
    "",
    "$ experience --years",
    "7+ years of professional development",
    "",
    "$ status",
    "Ready for new challenges! 🚀",
  ]

  useEffect(() => {
    if (currentLine < terminalLines.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => prev + terminalLines[currentLine] + "\n")
        setCurrentLine((prev) => prev + 1)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentLine, terminalLines])

  return (
    <div className="h-full bg-black text-green-400 font-mono text-sm p-4 overflow-auto">
      <div className="mb-4 text-gray-400">Terminal - João Bosco Skills</div>
      <pre className="whitespace-pre-wrap leading-relaxed">
        {displayedText}
        <span className="animate-pulse">█</span>
      </pre>
    </div>
  )
}

function ProjectsWindow() {
  const projects = [
    {
      name: "Plataforma de Microsserviços Bancários",
      description: "Arquitetura distribuída para processamento de transações financeiras com alta disponibilidade",
      tech: ["Java", "Spring Boot", "Kafka", "Redis", "PostgreSQL", "Docker", "Kubernetes"],
      status: "Em produção",
    },
    {
      name: "API Gateway Enterprise",
      description: "Gateway centralizado com rate limiting, autenticação JWT e monitoramento avançado",
      tech: [".NET Core", "Redis", "MongoDB", "Prometheus", "Grafana"],
      status: "Em produção",
    },
    {
      name: "Sistema de Event Sourcing",
      description: "Implementação de CQRS e Event Sourcing para auditoria e rastreabilidade completa",
      tech: ["Node.js", "EventStore", "RabbitMQ", "TypeScript"],
      status: "Concluído",
    },
    {
      name: "Pipeline CI/CD Avançado",
      description: "Automação completa com testes, segurança, deploy blue-green e rollback automático",
      tech: ["Jenkins", "Docker", "Terraform", "AWS", "SonarQube"],
      status: "Em produção",
    },
    {
      name: "Sistema de Machine Learning",
      description: "Plataforma para análise preditiva de fraudes em tempo real com MLOps",
      tech: ["Python", "TensorFlow", "Kubernetes", "Apache Spark", "MLflow"],
      status: "Em desenvolvimento",
    },
    {
      name: "Arquitetura Serverless",
      description: "Migração de monolito para arquitetura serverless com redução de 60% nos custos",
      tech: ["AWS Lambda", "API Gateway", "DynamoDB", "CloudFormation"],
      status: "Concluído",
    },
    {
      name: "Sistema de Observabilidade",
      description: "Stack completa de monitoramento, logging e tracing distribuído",
      tech: ["Elasticsearch", "Kibana", "Jaeger", "Prometheus", "Grafana"],
      status: "Em produção",
    },
  ]

  return (
    <div className="p-6 h-full bg-gray-800 flex flex-col">
      <h2 className="text-xl font-bold text-gray-100 mb-6 flex-shrink-0">Projetos Destacados</h2>
      <div className="space-y-4 overflow-y-auto flex-1 pr-2">
        {projects.map((project, index) => (
          <div
            key={index}
            className="bg-gray-700 rounded-lg p-4 shadow-sm border border-gray-600 hover:bg-gray-600/50 transition-colors duration-200"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-100">{project.name}</h3>
              <span
                className={cn(
                  "text-xs px-2 py-1 rounded-full",
                  project.status === "Em produção"
                    ? "bg-green-900 text-green-300 border border-green-700"
                    : project.status === "Concluído"
                      ? "bg-blue-900 text-blue-300 border border-blue-700"
                      : "bg-yellow-900 text-yellow-300 border border-yellow-700",
                )}
              >
                {project.status}
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-3">{project.description}</p>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((tech, techIndex) => (
                <span
                  key={techIndex}
                  className="bg-gray-600 text-gray-200 px-2 py-1 rounded text-xs border border-gray-500"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContactWindow() {
  return (
    <div className="p-6 h-full bg-gray-800">
      <h2 className="text-xl font-bold text-gray-100 mb-6">Entre em Contato</h2>
      <div className="space-y-6">

        <a
          href="https://www.linkedin.com/in/joao-bosco-7412a4227/?trk=opento_sprofile_topcard"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg border border-gray-600 hover:bg-gray-600 transition-colors duration-200"
        >
          <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center text-white text-xl">
            💼
          </div>
          <div>
            <div className="font-medium text-gray-200">LinkedIn</div>
            <div className="text-blue-400">linkedin.com/in/joao-bosco-7412a4227</div>
          </div>
        </a>

        <a
          href="https://github.com/JoaoBoscoD"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-4 p-4 bg-gray-700 rounded-lg border border-gray-600 hover:bg-gray-600 transition-colors duration-200"
        >
          <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white text-xl">
            💻
          </div>
          <div>
            <div className="font-medium text-gray-200">GitHub</div>
            <div className="text-blue-400">github.com/JoaoBoscoD</div>
          </div>
        </a>

        <div className="mt-8 p-4 bg-blue-900/30 rounded-lg border border-blue-700/50">
          <p className="text-blue-300 text-sm text-center">
            Disponível para novas oportunidades e projetos desafiadores!
          </p>
        </div>
      </div>
    </div>
  )
}
