import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera } from "lucide-react";
import * as THREE from "three";

export default function ARView() {
  const [, setLocation] = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const petMeshRef = useRef<THREE.Mesh | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!cameraActive) return;

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Camera access denied or not available");
        setCameraActive(false);
      }
    };

    initCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [cameraActive]);

  useEffect(() => {
    if (!canvasRef.current || !cameraActive) return;

    // Initialize Three.js scene
    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x000000, 0.1);

    sceneRef.current = scene;
    rendererRef.current = renderer;

    // Create simple 3D pet (cube with colors representing pet)
    const geometry = new THREE.BoxGeometry(1, 1.2, 0.8);
    const material = new THREE.MeshPhongMaterial({ color: 0xff69b4 });
    const petMesh = new THREE.Mesh(geometry, material);
    petMesh.position.z = -3;
    petMesh.castShadow = true;
    scene.add(petMesh);
    petMeshRef.current = petMesh;

    // Add eyes
    const eyeGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.25, 0.3, 0.5);
    petMesh.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.25, 0.3, 0.5);
    petMesh.add(rightEye);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    camera.position.z = 3;

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (petMeshRef.current) {
        petMeshRef.current.rotation.x += 0.005;
        petMeshRef.current.rotation.y += 0.01;
      }
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [cameraActive]);

  const capturePhoto = () => {
    if (!canvasRef.current) return;

    // Create composite canvas with both video and 3D model
    const displayCanvas = document.createElement("canvas");
    const ctx = displayCanvas.getContext("2d");
    if (!ctx) return;

    displayCanvas.width = canvasRef.current.width;
    displayCanvas.height = canvasRef.current.height;

    // Draw video frame
    if (videoRef.current) {
      ctx.drawImage(
        videoRef.current,
        0,
        0,
        displayCanvas.width,
        displayCanvas.height
      );
    }

    // Draw 3D model on top
    ctx.drawImage(canvasRef.current, 0, 0);

    // Download image
    const link = document.createElement("a");
    link.href = displayCanvas.toDataURL("image/png");
    link.download = `pet-ar-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pb-24">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={() => setLocation("/")}
            variant="ghost"
            size="sm"
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold font-['Outfit']" data-testid="text-page-title">
            🌍 AR Pet View
          </h1>
          <div className="w-24" />
        </div>

        {/* Status Badge */}
        <div className="mb-4 text-center">
          <Badge variant={cameraActive ? "default" : "secondary"} data-testid="badge-ar-status">
            {cameraActive ? "Camera Active" : "Camera Ready"}
          </Badge>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-4 bg-red-50 border-red-200">
            <CardContent className="p-4">
              <p className="text-red-600 text-sm" data-testid="text-error">
                ⚠️ {error}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Camera & Canvas Container */}
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative w-full bg-black aspect-video">
              {cameraActive ? (
                <>
                  {/* Hidden Video for camera feed */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover hidden"
                  />

                  {/* Canvas for 3D rendering */}
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    data-testid="canvas-ar-view"
                  />

                  {/* Overlay UI */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="text-white text-center mb-8">
                      <p className="text-lg font-semibold font-['Outfit']">
                        Your Pet in AR! 🐾
                      </p>
                      <p className="text-sm opacity-75 mt-2">
                        Move your phone to see your pet from different angles
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <div className="text-center">
                    <p className="text-lg font-semibold mb-4 font-['Outfit']">
                      Ready for AR Mode
                    </p>
                    <p className="text-sm opacity-75">
                      Enable your camera to see your pet in augmented reality
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="flex gap-3 flex-col sm:flex-row">
          <Button
            onClick={() => setCameraActive(!cameraActive)}
            size="lg"
            className="flex-1"
            data-testid={`button-${cameraActive ? "stop" : "start"}-camera`}
          >
            {cameraActive ? "Stop Camera" : "Start Camera"}
          </Button>
          {cameraActive && (
            <Button
              onClick={capturePhoto}
              size="lg"
              variant="secondary"
              className="flex-1"
              data-testid="button-capture-photo"
            >
              <Camera className="mr-2 w-4 h-4" />
              Capture Photo
            </Button>
          )}
        </div>

        {/* Info Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-2">About AR Pet View:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✨ View your virtual pet in augmented reality</li>
              <li>📸 Capture photos to share on social media</li>
              <li>🎯 Rotate and interact with your pet</li>
              <li>📱 Works best on mobile devices</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
