"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { DollarSign, BarChart3, FolderDownload, Calendar } from "lucide-react"

interface PayComponent {
  name: string
  type: "amount" | "percentage"
  value: number
  label: string
}

interface PayrollRun {
  id: string
  periodStart: string
  periodEnd: string
  payableDays: number
  netPay: number
  components: PayComponent[]
  status: "pending" | "processed" | "paid"
}

export default function PayrollPage() {
  const { user } = useAuth()
  const [periodStart, setPeriodStart] = useState<string>(new Date().toISOString().split("T")[0])
  const [periodEnd, setPeriodEnd] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  )
  const [grossPay, setGrossPay] = useState(0)
  const [deductions, setDeductions] = useState(0)
  const [netPay, setNetPay] = useState(0)
  const [payComponents, setPayComponents] = useState<PayComponent[]>([
    { name: "Basic Salary", type: "amount", value: 5000, label: "$5,000" },
    { name: "HRA", type: "amount", value: 1500, label: "$1,500" },
    { name: "Conveyance", type: "amount", value: 1000, label: "$1,000" },
  ])
  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([])

  const calculateNetPay = () => {
    const totalComponents = payComponents.reduce(
      (sum, comp) => sum + comp.value,
      0
    )
    const totalDeductions = 500 // PF + Tax example
    const net = totalComponents - totalDeductions
    setGrossPay(totalComponents)
    setDeductions(totalDeductions)
    setNetPay(net)
  }

  const handleGenerate = () => {
    calculateNetPay()
    // Generate payroll run
    const newRun: PayrollRun = {
      id: Date.now().toString(),
      periodStart,
      periodEnd,
      payableDays: 22,
      netPay,
      components: payComponents,
      status: "processed",
    }
    setPayrollRuns([...payrollRuns, newRun])
  }

  if (!user) {
    const signInPath = "/auth/signin"
    const navigate = (window as any).navigate || ((url: string) => {
      window.location.href = url
    })
    navigate(signInPath)
    return null
  }

  return (
    <div className="p-6 bg-paper min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h1 className="font-display font-semibold text-2xl text-ink">Payroll</h1>
          <DollarSign className="h-5 w-5 text-amber" />
        </div>

        {/* Employee payroll view */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          <div className="bg-surface border border-border rounded-md p-6">
            <h2 className="font-display font-semibold text-ink mb-4">Salary Details</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-slate">Gross Pay</p>
                <p className="font-display font-semibold text-3xl text-amber">${grossPay}</p>
              </div>
              <div>
                <p className="text-sm text-slate">Deductions</p>
                <p className="font-display font-semibold text-3xl text-rose">${deductions}</p>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <div className="flex justify-between items-center mb-4">
                <p className="font-display font-semibold text-ink">Net Pay</p>
                <p className="font-display font-serif-prime text-4xl font-bold text-ink">${netPay}</p>
              </div>
              <p className="text-sm text-slate">Payable after deductions</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-md p-6">
            <h2 className="font-display font-semibold text-ink mb-4">Component Breakdown</h2>
            <div className="space-y-3">
              {payComponents.map((comp, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-ink">{comp.name}</span>
                  <span className="font-mono text-amber">{comp.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pay period selector */}
        <div className="bg-surface border border-border rounded-md p-6 mb-6">
          <h2 className="font-display font-semibold text-ink mb-4">Pay Period</h2>
          <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate mb-1">Period Start</label>
              <Input
                type="date"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-slate mb-1">Period End</label>
              <Input
                type="date"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
            </div>
            <Button type="submit" onClick={handleGenerate} className="col-span-2">
              Generate Payslip
            </Button>
          </form>
        </div>

        {/* HR Admin payroll table */}
        <div>
          <h2 className="font-display font-semibold text-ink mb-4">Payroll Runs</h2>
          <Button variant="ghost" size="sm" onClick={() => {}}>
            Add Payroll Run
          </Button>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Employee</th>
                  <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Period</th>
                  <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Gross</th>
                  <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Deductions</th>
                  <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Net</th>
                  <th className="text-left text-sm uppercase text-slate tracking-wider py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payrollRuns.map((run) => (
                  <tr key={run.id} className="border-b border-border hover:bg-amber/5">
                    <td className="py-3 font-mono text-sm text-ink">{run.periodStart} - {run.periodEnd}</td>
                    <td className="py-3 font-mono text-sm text-ink">{run.periodStart} - {run.periodEnd}</td>
                    <td className="py-3 font-mono text-sm text-ink">${run.components.reduce((s, c) => s + c.value, 0)}</td>
                    <td className="py-3 font-mono text-sm text-ink">${500}</td>
                    <td className="py-3 font-mono text-sm text-ink">${run.netPay}</td>
                    <td className="py-3">
                      <span
                        className={`h-2 w-2 rounded-full ${
                          run.status === "paid" ? "bg-sage" :
                          run.status === "processed" ? "bg-amber" :
                          "bg-rose"
                        } border-2 border-surface mr-1`}
                        aria-hidden="true"
                      />
                      {run.status}
                    </td>
                  </tr>
                ))}
                {payrollRuns.length === 0 && (
                  <tr>
                    <td className="py-8 text-center text-slate" colSpan={6}>
                      No payroll runs
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}