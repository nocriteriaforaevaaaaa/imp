"use client";
import React from "react";
import {
  User,
  Phone,
  Mail,
  Shield,
  Bell,
  MapPin,
  Heart,
  Edit2,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";

export default function Profile() {
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-600" />
      </div>
    );
  }

  if (!user) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={user.imageUrl}
              alt="Profile"
              className="w-16 h-16 rounded-full border-2 border-red-100"
            />
            <div>
              <h1 className="text-3xl font-bold text-red-600">
                Welcome, {user.firstName || user.username}
              </h1>
              <p className="text-gray-600">Manage your safety profile</p>
            </div>
          </div>
        </header>
        <Card className="border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Personal Information
              </h2>
              <p className="text-gray-500">Your verified profile details</p>
            </div>
            <div>
              <button
                onClick={() => signOut({ redirectUrl: "/" })}
                className="bg-red-600 hover:bg-red-700 ra text-white px-6 py-3 flex items-center gap-2 transform hover:translate-x-1 transition-all duration-300  "
              >
                Sign out
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <User className="text-red-600" />
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <Mail className="text-red-600" />
                <div>
                  <p className="text-sm text-gray-500">Primary Email</p>
                  <p className="font-medium">
                    {user.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </div>
              {user.phoneNumbers && user.phoneNumbers[0] && (
                <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <Phone className="text-red-600" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium">
                      {user.phoneNumbers[0].phoneNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* Ai defense */}
        <Card className="mb-8 bg-gradient-to-r from-red-50 to-white border-red-100 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <Shield className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">
                    Prepare for the Future
                  </h2>
                  <p className="text-gray-600">
                    Master self-defense with our AI tutor
                  </p>
                </div>
              </div>
              <Button
                onClick={() => router.push("/defense")}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 flex items-center gap-2 transform hover:translate-x-1 transition-all duration-300"
              >
                Begin Training
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8"></div>
      </div>
    </div>
  );
}
