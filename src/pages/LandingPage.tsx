import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Calendar, DollarSign, Users, FileText, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Appetyte
              </h1>
              <div className="hidden md:flex space-x-6">
                <a href="#features" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Features</a>
                <a href="#how-it-works" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">How It Works</a>
                <a href="#testimonials" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Pricing</a>
                <a href="#footer" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">Contact</a>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="font-medium">
                Log in
              </Button>
              <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold rounded-lg shadow-sm">
                Sign up
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fef3e2] via-[#fef7e8] to-[#fffbf0]">
        <div className="mx-auto px-6 md:px-12 lg:px-24 py-16 md:py-24">
          <div className="max-w-5xl mx-auto text-center space-y-6 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-foreground text-background px-3 py-1 rounded-full text-xs font-semibold">
              <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-[10px] font-bold">NEW</span>
              <span>Weekly meal plans + auto-reminders</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight" style={{ color: '#1a0b2e' }}>
              The Tiffin Management System
            </h1>

            {/* Subtext */}
            <p className="text-lg md:text-xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
              Orders, payments, reminders, customer tracking—it's all here. Ditch the spreadsheets and WhatsApp chaos and manage your{" "}
              <span className="font-semibold">tiffin service</span>, <span className="font-semibold">meal delivery</span>, <span className="font-semibold">home kitchen</span>, or <span className="font-semibold">catering business</span> using one simple platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button size="default" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold rounded-lg shadow-sm">
                Sign up for free
              </Button>
              <Button size="default" variant="outline" className="bg-white border-2 border-foreground/20 hover:bg-gray-50 font-semibold rounded-lg">
                Is Appetyte for you?
              </Button>
            </div>

            {/* Integration Text */}
            <div className="pt-6">
              <div className="flex items-center justify-center gap-2 text-foreground/60 mb-4">
                <span className="text-sm">Integrate with nearly any tool or framework under the sun</span>
                <a href="#features" className="text-sm font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1">
                  View all
                  <ArrowRight className="h-3 w-3" />
                </a>
              </div>

              {/* Integration Icons */}
              <div className="flex items-center justify-center gap-6 md:gap-8 flex-wrap opacity-50">
                <Calendar className="h-10 w-10 md:h-12 md:w-12" />
                <Users className="h-10 w-10 md:h-12 md:w-12" />
                <DollarSign className="h-10 w-10 md:h-12 md:w-12" />
                <FileText className="h-10 w-10 md:h-12 md:w-12" />
                <CheckCircle2 className="h-10 w-10 md:h-12 md:w-12" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <div className="max-w-4xl mx-auto text-center">
            <button className="group inline-flex items-center gap-4 bg-[#1a0b2e] text-white px-8 py-4 rounded-full hover:bg-[#2a1b3e] transition-all duration-300 shadow-lg hover:shadow-xl">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <div className="w-0 h-0 border-l-[12px] border-l-white border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
              </div>
              <div className="text-left">
                <div className="font-bold text-lg">Watch product demo</div>
                <div className="text-sm text-white/80">See how Appetyte simplifies your workflow</div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section id="features" className="container mx-auto px-6 md:px-12 lg:px-24 py-20 bg-accent/30">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for home chefs and tiffin services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to run your tiffin business efficiently
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Calendar,
              title: "Order Management",
              description: "Take and track daily orders seamlessly with an intuitive dashboard."
            },
            {
              icon: DollarSign,
              title: "Payment Reminders",
              description: "Automate weekly payment updates for customers to ensure timely payments."
            },
            {
              icon: Users,
              title: "Customer Accounts",
              description: "Maintain balance and order history transparently for each customer."
            },
            {
              icon: FileText,
              title: "Summary Reports",
              description: "Get organized summaries to prepare food efficiently and plan ahead."
            }
          ].map((feature, index) => (
            <Card 
              key={index} 
              className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="container mx-auto px-6 md:px-12 lg:px-24 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              step: "01",
              title: "Create your account",
              description: "Sign up in seconds and set up your tiffin service profile."
            },
            {
              step: "02",
              title: "Add your customers",
              description: "Import your customer list and start taking orders right away."
            },
            {
              step: "03",
              title: "Automate & grow",
              description: "Get payment reminders and summaries automatically delivered."
            }
          ].map((item, index) => (
            <div key={index} className="relative animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 text-white text-2xl font-bold flex items-center justify-center mx-auto shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
              {index < 2 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent"></div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="container mx-auto px-6 md:px-12 lg:px-24 py-20 bg-accent/30">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Loved by tiffin providers and customers alike
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Priya Sharma",
              role: "Home Chef, Mumbai",
              text: "Appetyte made managing 50+ daily orders easy and error-free! I can focus on cooking instead of spreadsheets."
            },
            {
              name: "Rajesh Kumar",
              role: "Tiffin Service Owner",
              text: "The payment reminders are a game-changer. No more awkward calls to customers about pending payments."
            },
            {
              name: "Anita Desai",
              role: "Customer",
              text: "As a customer, I love being able to track my orders and balance. Everything is so transparent and easy!"
            }
          ].map((testimonial, index) => (
            <Card 
              key={index}
              className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-base">{testimonial.name}</CardTitle>
                    <CardDescription className="text-sm">{testimonial.role}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground italic">"{testimonial.text}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 md:px-12 lg:px-24 py-20">
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to simplify your tiffin business?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join hundreds of tiffin providers who trust Appetyte to manage their daily operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                Book a Demo
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer id="footer" className="border-t bg-muted/30">
        <div className="container mx-auto px-6 md:px-12 lg:px-24 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Appetyte
              </h3>
              <p className="text-sm text-muted-foreground">
                Making tiffin management effortless.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
                <li><a href="#testimonials" className="hover:text-primary transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2025 Appetyte. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
