"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { Calendar, Settings, Check, User, FileText, DollarSign, Leaf, Heart } from "lucide-react"

interface ProfileTab {
  value: "personal" | "employment" | "documents" | "attendance" | "leave" | "payroll"
  label: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [selectedTab, setSelectedTab] = useState<ProfileTab["value"]>("personal")
  const [profile, setProfile] = useState<any>(null)

  // Mock profile data
  useEffect(() => {
    setProfile({
      fullName: "John Doe",
      employeeId: "EMP-001",
      dateOfBirth: "1990-05-15",
      gender: "Male",
      email: "john.doe@company.com",
      phone: "+1 (555) 123-4567",
      address: "123 HRMS Avenue, Tech City",
      department: "Engineering",
      designation: "Senior Software Developer",
      joiningDate: "2020-01-15",
      employmentType: "Full-time",
      reportingManager: "Sarah Johnson",
      status: "Active",
      nationality: "American",
      genderDisplay: "Male",
      maritalStatus: "Married",
      personalEmail: "john.doe.personal@gmail.com",
      jobTitle: "Senior Developer",
    })
  }, [user])

  const handleTabChange = (value: ProfileTab["value"]) => {
    setSelectedTab(value)
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
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <h1 className="font-display font-semibold text-2xl text-ink">My Profile</h1>
          <Settings className="h-5 w-5 text-amber" />
        </div>

        {/* Tab navigation */}
        <div className="border-b border-border mb-6">
          <div className="flex">
            {[
              "personal",
              "employment",
              "documents",
              "attendance",
              "leave",
              "payroll",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`flex-1 py-3 text-sm font-medium text-slate transition-colors ${
                  selectedTab === tab
                    ? "border-b-2 border-amber text-amber"
                    : "border-b-2 border-transparent text-slate"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="bg-surface border border-border rounded-md p-6">
          {selectedTab === "personal" && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-border flex items-center justify-center flex-shrink-0">
                  <img
                    src "/avatar.png"
                    alt="Profile"
                    className="h-12 w-12 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-2xl text-ink">John Doe</h2>
                  <p className="text-sm text-slate">Senior Software Developer</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate mb-1">Full Name</label>
                  <Input placeholder="John Doe" readOnly />
                </div>
                <div>
                  <label className="block text-sm text-slate mb-1">Employee ID</label>
                  <Input placeholder="EMP-001" readOnly />
                </div>
                <div>
                  <label className="block text-sm text-slate mb-1">Employee ID</label>
                  <Input placeholder="EMP-001" readOnly />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate mb-1">Date of Birth</label>
                  <Input placeholder="1990-05-15" readOnly />
                </div>
                <div>
                  <label className="block text-sm text-slate mb-1">Gender</label>
                  <Input placeholder="Male" readOnly />
                </div>
                <div>
                  <label className="block text-sm text-slate mb-1">Email</label>
                  <Input placeholder="john.doe@company.com" readOnly />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate mb-1">Phone</label>
                  <Input placeholder="+1 (555) 123-4567" readOnly />
                </div>
                <div>
                  <label className="block text-sm text-slate mb-1">Address</label>
                  <Input placeholder="123 HRMS Avenue, Tech City" readOnly />
                  < rows={2} />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate mb-1">Personal Email</label>
                <Input placeholder="john.doe.personal@gmail.com" readOnly />
              </div>
            </div>
          )}

          {selectedTab === "employment" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate mb-1">Department</label>
                  <Input placeholder="Engineering" readOnly />
                </div>
                <div>
                  <label className="block text-sm text-slate mb-1">Designation</label>
                  <Input placeholder="Senior Software Developer" readOnly />
                </div>
                <div>
                  <label className="block text-sm text-slate mb-1">Joining Date</label>
                  <Input placeholder="2020-01-15" readOnly />
                </div>
                <div>
                  <label className="block text-sm text-slate mb-1">Employment Type</label>
                  <Input placeholder="Full-time" readOnly />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate mb-1">Reporting Manager</label>
                <Input placeholder="Sarah Johnson" readOnly />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate mb-1">Nationality</label>
                  <Input placeholder="American" readOnly />
                </div>
                <div>
                  <label className="block text-sm text-slate mb-1">Marital Status</label>
                  <Input placeholder="Married" readOnly />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate mb-1">Job Title</label>
                <Input placeholder="Senior Developer" readOnly />
              </div>
            </div>
          )}

          {selectedTab === "documents" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-slate mb-1">Profile Picture</label>
                <div className="h-32 w-48 bg-border rounded-md flex items-center justify-center">
                  <img src="/avatar.png" alt="Profile" className="h-16 w-16 rounded-full object-cover" />
                </div>
                <Input type="file" className="mt-2 w-full" />
              </div>

              <div>
                <label className="block text-sm text-slate mb-1">PAN Number</label>
                <Input placeholder="ABCPD1234F" readOnly />
              </div>

              <div>
                <label className="block text-sm text-slate mb-1">PF Number</label>
                <Input placeholder="PNF123456789" readOnly />
              </div>

              <div>
                <label className="block text-sm text-slate mb-1">Aadhar Number</label>
                <Input placeholder="1234 5678 9012" readOnly />
              </div>

              <div>
                <label className="block text-sm text-slate mb-1">Resume</label>
                <div className="h-32 w-48 bg-border rounded-md flex items-center justify-center">
                  <span className="text-slate">No resume uploaded</span>
                </div>
                <Input type="file" className="mt-2 w-full" />
              </div>
            </div>
          )}

          {selectedTab === "attendance" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-slate mb-1">Today's Attendance</label>
                <Button variant="ghost" size="sm">
                  View Details
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate mb-1">Check-in</label>
                  <Input placeholder="09:00" readOnly />
                </div>
                <div>
                  <label className="block text-sm text-slate mb-1">Check-out</label>
                  <Input placeholder="18:00" readOnly />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate mb-1">Working Hours</label>
                <Input placeholder="8h" readOnly />
              </div>

              <div>
                <label className="block text-sm text-slate mb-1">Status</label>
                <span className="h-2 w-2 rounded-full bg-sage border-2 border-surface mr-1" aria-hidden="true" />
                <span className="text-sm">Present</span>
              </div>
            </div>
          )}

          {selectedTab === "leave" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-slate mb-1">Leave Balance</label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-surface border border-border rounded-md p-3">
                    <p className="text-xs text-slate">Paid</p>
                    <p className="font-display font-semibold text-2xl text-amber">15 days</p>
                  </div>
                  <div className="bg-surface border border-border rounded-md p-3">
                    <p className="text-xs text-slate">Sick</p>
                    <p className="font-display font-semibold text-2xl text-amber">10 days</p>
                  </div>
                  <div className="bg-surface border border-border rounded-md p-3">
                    <p className="text-xs text-slate">Unpaid</p>
                    <p className="font-display font-semibold text-2xl text-amber">5 days</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate mb-1">Recent Leave Requests</label>
                <Button variant="ghost" size="sm">View All</Button>
              </div>

              <div>
                <label className="block text-sm text-slate mb-1">Request New Leave</Button>
              </div>
            </div>
          )}

          {selectedTab === "payroll" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm text-slate mb-1">Salary Information</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate">Basic Salary</p>
                    <Input placeholder="$5,000/month" readOnly />
                  </div>
                  <div>
                    <p className="text-sm text-slate">HRA</p>
                    <Input placeholder="$1,500/month" readOnly />
                  </div>
                  <div>
                    <p className="text-sm text-slate">PF</p>
                    <Input placeholder="$500/month" readOnly />
                  </div>
                  <div>
                    <p className="text-sm text-slate">Tax</p>
                    <Input placeholder="$200/month" readOnly />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate">Net Salary</p>
                  <Input placeholder="$5,800/month" readOnly className="font-semibold" />
                </div>
                <div>
                  <p className="text-sm text-slate">Payment Status</p>
                  <span className="h-2 w-2 rounded-full bg-sage border-2 border-surface mr-1" aria-hidden="true" />
                  <span className="text-sm">Active</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate mb-1">Pay Period</label>
                <Input placeholder="Jan 2024 - Jan 2024" readOnly />
              </div>

              <div>
                <label className="block text-sm text-slate mb-1">Payment Date</label>
                <Input placeholder="25th of month" readOnly />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}