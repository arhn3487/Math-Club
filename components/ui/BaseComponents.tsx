'use client'

import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  className?: string
  fullWidth?: boolean
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
  fullWidth = false,
}: ButtonProps) {
  const baseStyles =
    'mono-button inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50'

  const variantStyles = {
    primary: 'mono-button',
    secondary: 'mono-button--light',
    danger: 'mono-button bg-neutral-950 text-white hover:bg-neutral-800',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles[variant]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
    >
      {children}
    </button>
  )
}

interface InputProps {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  required?: boolean
  className?: string
  label?: string
  error?: string
}

export function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  className = '',
  label,
  error,
}: InputProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm font-semibold text-neutral-700">{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`mono-input ${error ? 'border-red-500' : ''} ${className}`}
      />
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  )
}

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      className={`mono-card p-6 ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface LoadingProps {
  message?: string
}

export function Loading({ message = 'Loading...' }: LoadingProps) {
  return (
    <div className="flex items-center justify-center gap-3 p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
      <span className="text-neutral-600">{message}</span>
    </div>
  )
}

interface ErrorProps {
  message: string
  onRetry?: () => void
}

export function Error({ message, onRetry }: ErrorProps) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
      <p className="mb-2 font-semibold text-red-600">Error</p>
      <p className="mb-4 text-red-500">{message}</p>
      {onRetry && <Button onClick={onRetry}>Retry</Button>}
    </div>
  )
}

interface BadgeProps {
  children: ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'danger'
}

export function Badge({ children, variant = 'primary' }: BadgeProps) {
  const variantStyles = {
    primary: 'border-neutral-300 bg-neutral-50 text-neutral-800',
    success: 'border-neutral-300 bg-white text-neutral-800',
    warning: 'border-neutral-300 bg-neutral-50 text-neutral-700',
    danger: 'border-neutral-900 bg-neutral-900 text-white',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold ${variantStyles[variant]}`}
    >
      {children}
    </span>
  )
}
