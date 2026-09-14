"use client";

import { useState } from "react";
import { addContact, deleteContact, updateContact } from "@/lib/actions";
import { Contact } from "@/lib/types";
import { ConfirmDeleteButton } from "@/app/components/ConfirmDeleteButton";

export function ContactsSection({
  companyId,
  contacts,
}: {
  companyId: number;
  contacts: Contact[];
}) {
  const [adding, setAdding] = useState(contacts.length === 0);

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-semibold text-slate-900">Contacts</h2>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-sm text-emerald-700 hover:underline"
          >
            + Add contact
          </button>
        )}
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Look for someone in purchasing / procurement / operations / admin
        &mdash; that&apos;s usually who signs off on a fleet or supply
        decision.
      </p>

      {contacts.length === 0 && !adding && (
        <p className="text-sm text-slate-400">No contacts yet.</p>
      )}

      <ul className="space-y-3 mb-4">
        {contacts.map((contact) => (
          <ContactRow
            key={contact.id}
            companyId={companyId}
            contact={contact}
          />
        ))}
      </ul>

      {adding && (
        <form
          action={async (formData) => {
            await addContact(companyId, formData);
            setAdding(false);
          }}
          className="border border-dashed border-slate-300 rounded-md p-4 space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <Input name="name" label="Name" required />
            <Input name="title" label="Title / role" placeholder="Purchasing Manager" />
            <Input name="department" label="Department" placeholder="Procurement" />
            <Input name="phone" label="Phone" />
            <Input name="email" label="Email" />
            <label className="flex items-center gap-2 text-sm text-slate-600 mt-6">
              <input type="checkbox" name="is_primary" defaultChecked={contacts.length === 0} />
              Primary contact
            </label>
          </div>
          <Input name="notes" label="Notes" placeholder="How you found them, gatekeeper info, etc." />
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-emerald-600 text-white text-sm px-3 py-1.5 hover:bg-emerald-700"
            >
              Save contact
            </button>
            {contacts.length > 0 && (
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="text-sm text-slate-500 hover:text-slate-800 px-3 py-1.5"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}

function ContactRow({
  companyId,
  contact,
}: {
  companyId: number;
  contact: Contact;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="border border-slate-300 rounded-md p-4">
        <form
          action={async (formData) => {
            await updateContact(contact.id, companyId, formData);
            setEditing(false);
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <Input name="name" label="Name" defaultValue={contact.name} required />
            <Input name="title" label="Title / role" defaultValue={contact.title ?? ""} />
            <Input name="department" label="Department" defaultValue={contact.department ?? ""} />
            <Input name="phone" label="Phone" defaultValue={contact.phone ?? ""} />
            <Input name="email" label="Email" defaultValue={contact.email ?? ""} />
            <label className="flex items-center gap-2 text-sm text-slate-600 mt-6">
              <input
                type="checkbox"
                name="is_primary"
                defaultChecked={!!contact.is_primary}
              />
              Primary contact
            </label>
          </div>
          <Input name="notes" label="Notes" defaultValue={contact.notes ?? ""} />
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-emerald-600 text-white text-sm px-3 py-1.5 hover:bg-emerald-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-sm text-slate-500 hover:text-slate-800 px-3 py-1.5"
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="border border-slate-200 rounded-md p-4 flex items-start justify-between gap-3">
      <div>
        <div className="font-medium text-slate-800 flex items-center gap-2">
          {contact.name}
          {!!contact.is_primary && (
            <span className="text-xs rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">
              Primary
            </span>
          )}
        </div>
        <div className="text-sm text-slate-500">
          {[contact.title, contact.department].filter(Boolean).join(" · ")}
        </div>
        <div className="text-sm text-slate-500 mt-1 flex gap-3 flex-wrap">
          {contact.phone && <span>{contact.phone}</span>}
          {contact.email && <span>{contact.email}</span>}
        </div>
        {contact.notes && (
          <div className="text-sm text-slate-400 mt-1">{contact.notes}</div>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
        >
          Edit
        </button>
        <form action={deleteContact.bind(null, contact.id, companyId)}>
          <ConfirmDeleteButton confirmText={`Delete contact ${contact.name}?`} />
        </form>
      </div>
    </li>
  );
}

function Input({
  name,
  label,
  defaultValue,
  placeholder,
  required,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">
        {label}
      </label>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
      />
    </div>
  );
}
