
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Star, 
  Calendar,
  CheckCircle,
  Award,
  Users,
  Heart,
  Shield,
  Smile
} from "lucide-react"

export default function DentistPortfolio() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: ""
  })

  const services = [
    {
      title: "Implantes Dentários",
      description: "Reposição de dentes perdidos com tecnologia avançada",
      icon: <CheckCircle className="w-6 h-6" />,
      price: "A partir de R$ 2.500"
    },
    {
      title: "Ortodontia",
      description: "Aparelhos ortodônticos e alinhadores invisíveis",
      icon: <Smile className="w-6 h-6" />,
      price: "A partir de R$ 180/mês"
    },
    {
      title: "Clareamento Dental",
      description: "Clareamento profissional para um sorriso radiante",
      icon: <Star className="w-6 h-6" />,
      price: "A partir de R$ 400"
    },
    {
      title: "Limpeza e Prevenção",
      description: "Limpeza profissional e cuidados preventivos",
      icon: <Shield className="w-6 h-6" />,
      price: "A partir de R$ 120"
    }
  ]

  const testimonials = [
    {
      name: "Maria Silva",
      text: "Excelente profissional! Fiz meu implante e ficou perfeito. Recomendo!",
      rating: 5,
      treatment: "Implante Dentário"
    },
    {
      name: "João Santos",
      text: "Atendimento impecável. Meu sorriso ficou incrível após o clareamento.",
      rating: 5,
      treatment: "Clareamento"
    },
    {
      name: "Ana Costa",
      text: "Dra. muito atenciosa e cuidadosa. Meu tratamento ortodôntico foi um sucesso!",
      rating: 5,
      treatment: "Ortodontia"
    }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Agendamento solicitado:", formData)
    alert("Agendamento solicitado! Entraremos em contato em breve.")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Smile className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dr. Ana Oliveira</h1>
                <p className="text-sm text-gray-600">Cirurgiã-Dentista</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#sobre" className="text-gray-600 hover:text-blue-600 transition-colors">Sobre</a>
              <a href="#servicos" className="text-gray-600 hover:text-blue-600 transition-colors">Serviços</a>
              <a href="#depoimentos" className="text-gray-600 hover:text-blue-600 transition-colors">Depoimentos</a>
              <a href="#contato" className="text-gray-600 hover:text-blue-600 transition-colors">Contato</a>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Calendar className="w-4 h-4 mr-2" />
                Agendar Consulta
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Seu sorriso é nossa <span className="text-blue-600">prioridade</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Mais de 15 anos cuidando da saúde bucal com tecnologia avançada 
              e atendimento humanizado. Transformamos sorrisos e vidas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Calendar className="w-5 h-5 mr-2" />
                Agendar Avaliação Gratuita
              </Button>
              <Button size="lg" variant="outline">
                <Phone className="w-5 h-5 mr-2" />
                (11) 99999-9999
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl font-bold text-gray-900 mb-6">
                Conheça a Dra. Ana Oliveira
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Graduada em Odontologia pela USP com especializações em Implantodontia 
                e Ortodontia. Dedico minha carreira a proporcionar tratamentos de 
                excelência com foco no bem-estar e satisfação dos meus pacientes.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Award className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-semibold">15+ Anos</p>
                    <p className="text-sm text-gray-600">de Experiência</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-semibold">2000+</p>
                    <p className="text-sm text-gray-600">Pacientes Atendidos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Heart className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-semibold">98%</p>
                    <p className="text-sm text-gray-600">Satisfação</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-semibold">5.0</p>
                    <p className="text-sm text-gray-600">Avaliação Média</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 rounded-2xl p-8 text-center">
              <div className="w-48 h-48 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full mx-auto mb-6 flex items-center justify-center">
                <span className="text-6xl text-white">👩‍⚕️</span>
              </div>
              <div className="space-y-2">
                <Badge variant="secondary">CRO-SP 12345</Badge>
                <Badge variant="secondary">Especialista em Implantodontia</Badge>
                <Badge variant="secondary">Especialista em Ortodontia</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section id="servicos" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Nossos Serviços
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Oferecemos uma gama completa de tratamentos dentários com 
              tecnologia de ponta e cuidado personalizado.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-blue-600">{service.icon}</div>
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  <p className="font-semibold text-blue-600">{service.price}</p>
                  <Button className="w-full mt-4" variant="outline">
                    Saiba Mais
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="depoimentos" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              O que nossos pacientes dizem
            </h3>
            <p className="text-xl text-gray-600">
              Experiências reais de quem confia em nosso trabalho
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.treatment}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 italic">"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Agendamento */}
      <section id="contato" className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-4xl font-bold mb-6">
                Agende sua consulta
              </h3>
              <p className="text-xl text-blue-100 mb-8">
                Entre em contato conosco e transforme seu sorriso. 
                Primeira consulta com avaliação gratuita!
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-6 h-6" />
                  <div>
                    <p className="font-semibold">(11) 99999-9999</p>
                    <p className="text-blue-100">WhatsApp disponível</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6" />
                  <div>
                    <p className="font-semibold">contato@draanaveira.com.br</p>
                    <p className="text-blue-100">Resposta em até 2 horas</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-6 h-6" />
                  <div>
                    <p className="font-semibold">Rua das Flores, 123 - Vila Madalena</p>
                    <p className="text-blue-100">São Paulo - SP</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6" />
                  <div>
                    <p className="font-semibold">Seg a Sex: 8h às 18h</p>
                    <p className="text-blue-100">Sáb: 8h às 14h</p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="bg-white text-gray-900">
              <CardHeader>
                <CardTitle>Formulário de Agendamento</CardTitle>
                <CardDescription>
                  Preencha os dados abaixo e retornaremos o contato
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  <Input
                    type="email"
                    placeholder="Seu e-mail"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                  <Input
                    placeholder="Seu telefone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                  <Input
                    placeholder="Serviço de interesse"
                    value={formData.service}
                    onChange={(e) => setFormData({...formData, service: e.target.value})}
                  />
                  <Textarea
                    placeholder="Mensagem (opcional)"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={3}
                  />
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Solicitar Agendamento
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Smile className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Dr. Ana Oliveira</span>
          </div>
          <p className="text-gray-400 mb-4">
            Cuidando do seu sorriso com excelência e dedicação
          </p>
          <p className="text-sm text-gray-500">
            © 2024 Dr. Ana Oliveira - Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  )
}
