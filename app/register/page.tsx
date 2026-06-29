import AuthShell from "@/components/auth/auth-shell";
import RegisterForm from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Crea tu cuenta"
      subtitle="Reserva tu username y empieza a construir tu perfil dentro de GatherGram."
      footerText="Ya tienes cuenta?"
      footerHref="/login"
      footerLink="Iniciar sesion"
    >
      <RegisterForm />
    </AuthShell>
  );
}
