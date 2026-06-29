import AuthShell from "@/components/auth/auth-shell";
import LoginForm from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      title="Inicia sesion"
      subtitle="Entra a tu feed, conecta con tu comunidad y sigue creando en GatherGram."
      footerText="Todavia no tienes cuenta?"
      footerHref="/register"
      footerLink="Crear cuenta"
    >
      <LoginForm />
    </AuthShell>
  );
}
