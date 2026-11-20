"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  BUDGETS,
  CONTACT_METHODS,
  PROPERTY_TYPES,
  contactSchema,
  type ContactFormData,
  type ContactFormInput,
} from "@/lib/contact-schema";
import { EASE_OUT } from "@/lib/motion";

type Status = "idle" | "submitting" | "success" | "error";

/**
 * Where submissions go. On a server deploy this is our own /api/contact route
 * (Resend). On static hosting (GitHub Pages) set NEXT_PUBLIC_CONTACT_ENDPOINT
 * to a form service such as Formspree (https://formspree.io/f/xxxx).
 */
const EXTERNAL_ENDPOINT = process.env.NEXT_PUBLIC_CONTACT_ENDPOINT || "";

const defaultValues: ContactFormInput = {
  name: "",
  phone: "",
  email: "",
  city: "",
  propertyType: "",
  budget: "",
  message: "",
  contactMethod: "Call",
  website: "",
};

function Field({
  id,
  label,
  optional,
  error,
  hint,
  className = "",
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="flex items-baseline justify-between text-[11px] uppercase tracking-[0.2em] text-ink/70">
        <span>
          {label}
          {!optional && <span className="text-gold" aria-hidden="true"> *</span>}
        </span>
        {optional && <span className="normal-case tracking-normal text-ink/55">Optional</span>}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-2 text-[12px] text-ink/55">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-[13px] text-[#E2A48C]">
          {error}
        </p>
      )}
    </div>
  );
}

export function ContactForm() {
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState("");
  const startedAt = useRef<number>(0);
  const successRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors },
  } = useForm<ContactFormInput, unknown, ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues,
    mode: "onTouched",
  });

  const method = watch("contactMethod");

  const onSubmit = async (data: ContactFormData) => {
    setStatus("submitting");
    setServerMessage("");
    try {
      const res = EXTERNAL_ENDPOINT
        ? await fetch(EXTERNAL_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
              ...data,
              _subject: `Consultation request — ${data.name}`,
              _replyto: data.email || undefined,
              _gotcha: data.website, // Formspree's honeypot field
              website: undefined,
            }),
          })
        : await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...data, startedAt: startedAt.current }),
          });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
        fieldErrors?: Record<string, string>;
      };
      if (!res.ok || !json.ok) {
        if (json.fieldErrors) {
          for (const [key, message] of Object.entries(json.fieldErrors)) {
            if (key in defaultValues) setError(key as keyof ContactFormInput, { message }, { shouldFocus: true });
          }
        }
        // Inputs are intentionally left untouched so nothing is lost.
        setServerMessage(json.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("success");
      reset(defaultValues);
      startedAt.current = Date.now();
      setTimeout(() => successRef.current?.focus(), 50);
    } catch {
      setServerMessage("We couldn't reach the server. Check your connection and try again — your details are still here.");
      setStatus("error");
    }
  };

  const aria = (name: keyof ContactFormInput, hint = false) => ({
    id: fid(name),
    "aria-invalid": errors[name] ? (true as const) : undefined,
    "aria-describedby": errors[name] ? `${fid(name)}-error` : hint ? `${fid(name)}-hint` : undefined,
  });

  const input =
    "mt-3 block w-full border-0 border-b border-ink/20 bg-transparent px-0 py-3 text-[16px] text-ink/90 placeholder:text-ink/30 transition-colors duration-800 ease-lux focus:border-gold focus:outline-none focus:ring-0 aria-[invalid=true]:border-[#E2A48C]";

  return (
    <div className="relative">
      {/* Status messages for screen readers and sighted users alike */}
      <div aria-live="polite" role="status" className="sr-only">
        {status === "submitting" && "Sending your request…"}
        {status === "success" && "Thank you. Your request has been sent."}
        {status === "error" && serverMessage}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: EASE_OUT }}
            className="border-t border-gold/50 pt-10"
          >
            <p className="label mb-5">Received</p>
            <h3 ref={successRef} tabIndex={-1} className="font-serif text-4xl font-light leading-tight text-ink/90 focus:outline-none">
              Thank you — we&rsquo;ll be in touch shortly.
            </h3>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink/60">
              Your request is with the studio. Expect a call or message within one working day to
              arrange your consultation.
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="link-underline mt-10 text-[11px] uppercase tracking-label text-gold"
            >
              Send another request
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            aria-label="Consultation request"
            className="grid gap-x-8 gap-y-9 sm:grid-cols-2"
          >
            <Field id={fid("name")} label="Name" error={errors.name?.message}>
              <input {...register("name")} {...aria("name")} type="text" autoComplete="name" className={input} />
            </Field>

            <Field id={fid("phone")} label="Phone" error={errors.phone?.message} hint="Indian mobile, e.g. +91 98765 43210">
              <input
                {...register("phone")}
                {...aria("phone", true)}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+91"
                className={input}
              />
            </Field>

            <Field id={fid("email")} label="Email" optional={method !== "Email"} error={errors.email?.message}>
              <input {...register("email")} {...aria("email")} type="email" autoComplete="email" className={input} />
            </Field>

            <Field id={fid("city")} label="City" optional error={errors.city?.message}>
              <input {...register("city")} {...aria("city")} type="text" autoComplete="address-level2" className={input} />
            </Field>

            <Field id={fid("propertyType")} label="Property type" optional error={errors.propertyType?.message}>
              <div className="select-wrap">
                <select {...register("propertyType")} {...aria("propertyType")} className={`${input} appearance-none pr-8`}>
                  <option value="">Select</option>
                  {PROPERTY_TYPES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </Field>

            <Field id={fid("budget")} label="Budget range" optional error={errors.budget?.message}>
              <div className="select-wrap">
                <select {...register("budget")} {...aria("budget")} className={`${input} appearance-none pr-8`}>
                  <option value="">Select</option>
                  {BUDGETS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </Field>

            <Field id={fid("message")} label="Message" optional error={errors.message?.message} className="sm:col-span-2">
              <textarea
                {...register("message")}
                {...aria("message")}
                rows={4}
                placeholder="The space, the rooms involved, your timeline…"
                className={`${input} resize-y`}
              />
            </Field>

            <fieldset
              className="sm:col-span-2"
              aria-describedby={errors.contactMethod ? `${fid("contactMethod")}-error` : undefined}
            >
              <legend className="text-[11px] uppercase tracking-[0.2em] text-ink/70">Preferred contact method</legend>
              <div className="mt-4 flex flex-wrap gap-3">
                {CONTACT_METHODS.map((m) => (
                  <label key={m} className="radio-pill">
                    <input {...register("contactMethod")} type="radio" value={m} className="peer sr-only" />
                    <span>{m}</span>
                  </label>
                ))}
              </div>
              {errors.contactMethod && (
                <p id={`${fid("contactMethod")}-error`} className="mt-2 text-[13px] text-[#E2A48C]">
                  {errors.contactMethod.message}
                </p>
              )}
            </fieldset>

            {/* Honeypot — invisible to people and assistive tech; bots fill it in. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor={fid("website")}>Website</label>
              <input {...register("website")} id={fid("website")} type="text" tabIndex={-1} autoComplete="off" />
            </div>

            <div className="flex flex-col gap-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="submit"
                disabled={status === "submitting"}
                aria-busy={status === "submitting"}
                className="inline-flex h-12 min-w-[15rem] items-center justify-center gap-3 bg-gold px-8 text-[11px] uppercase tracking-label text-bg transition-opacity duration-800 ease-lux hover:opacity-90 disabled:cursor-wait disabled:opacity-70"
              >
                {status === "submitting" ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border border-bg/40 border-t-bg" aria-hidden="true" />
                    Sending…
                  </>
                ) : (
                  "Request a consultation"
                )}
              </button>
              <p className="text-[12px] text-ink/55">We never share your details.</p>
            </div>

            {status === "error" && serverMessage && (
              <p className="border-l border-[#E2A48C] pl-4 text-[14px] text-[#E2A48C] sm:col-span-2">{serverMessage}</p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
