interface Requirement {
  label: string
  met: boolean
}

function getRequirements(password: string): Requirement[] {
  return [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One digit', met: /\d/.test(password) },
    { label: 'One special character (!@#$%^&* etc.)', met: /[^A-Za-z0-9]/.test(password) },
  ]
}

export function allRequirementsMet(password: string): boolean {
  return getRequirements(password).every((r) => r.met)
}

interface PasswordRequirementsProps {
  password: string
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const requirements = getRequirements(password)

  return (
    <ul className="space-y-1 text-xs">
      {requirements.map((req) => (
        <li key={req.label} className="flex items-center gap-1.5">
          <span className={req.met ? 'text-green-500' : 'text-muted-foreground'} aria-hidden="true">
            {req.met ? '\u2713' : '\u2717'}
          </span>
          <span className={req.met ? 'text-green-500' : 'text-muted-foreground'}>{req.label}</span>
        </li>
      ))}
    </ul>
  )
}
