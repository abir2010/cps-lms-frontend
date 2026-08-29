"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function SiteConfigurationPage() {
  const [isSaving, setIsSaving] = useState(false);

  const [config, setConfig] = useState({
    platformName: "Explora Learn",
    supportEmail: "support@explora.com",
    maxUploadSize: "500",
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate an API call to Strapi
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert("Configuration saved successfully.");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Site Configuration
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage global platform settings and parameters.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            These settings affect the public-facing platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="platformName">Platform Name</Label>
            <Input
              id="platformName"
              value={config.platformName}
              onChange={(e) =>
                setConfig({ ...config, platformName: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support Contact Email</Label>
            <Input
              id="supportEmail"
              type="email"
              value={config.supportEmail}
              onChange={(e) =>
                setConfig({ ...config, supportEmail: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxUploadSize">
              Maximum Video Upload Size (MB)
            </Label>
            <Input
              id="maxUploadSize"
              type="number"
              value={config.maxUploadSize}
              onChange={(e) =>
                setConfig({ ...config, maxUploadSize: e.target.value })
              }
            />
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving Changes..." : "Save Configuration"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
