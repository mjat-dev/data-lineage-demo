import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CloudUpload, Image, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { uploadFile, submitTask } from '@/lib/api';
import WalletModal from '@/components/WalletModal';

export default function TaskPage() {
  const navigate = useNavigate();
  const { walletAddress, isLoggedIn, setSubmission } = useApp();

  const [foodImage, setFoodImage] = useState<File | null>(null);
  const [foodName, setFoodName] = useState('');
  const [foodWeight, setFoodWeight] = useState('');
  const [cookingMethod, setCookingMethod] = useState('');
  const [calories, setCalories] = useState('');
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);

  // IDs stored by Frontier page when user clicks a frontier card
  const taskId = sessionStorage.getItem('codatta_task_id') || '10318807159400100038';
  const templateId = sessionStorage.getItem('codatta_template_id') || 'MVP_DEMO_TPL';

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) setFoodImage(file);
  };

  const formFilled = !!(foodImage && foodName.trim() && foodWeight.trim() && cookingMethod.trim() && calories.trim());

  const doSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      // 1. Upload image
      const imageUrl = await uploadFile(foodImage!);

      // 2. Submit task data
      const result = await submitTask({
        taskId,
        templateId,
        data: {
          food_name: foodName.trim(),
          food_weight: foodWeight.trim(),
          cooking_method: cookingMethod.trim(),
          calories: calories.trim(),
          food_image: imageUrl,
        },
      });

      // 3. Save to context for Dashboard display
      setSubmission({
        id: result.submission_id,
        foodName: foodName.trim(),
        foodWeight: foodWeight.trim(),
        cookingMethod: cookingMethod.trim(),
        calories: calories.trim(),
        foodImageName: foodImage!.name,
        foodImageUrl: imageUrl,
        submittedAt: new Date().toISOString(),
        taskId,
        templateId,
        status: result.status || 'submitted',
      });

      navigate('/profile');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setShowWalletModal(true);
      return;
    }
    if (!formFilled) return;
    doSubmit();
  };

  const inputClass = "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FFA800] focus:ring-2 focus:ring-[#FFA800]/10 placeholder:text-gray-300 transition-all";
  const labelClass = "text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-2";

  return (
    <main className="pt-24 pb-20 bg-[#F5F5F5]">
      <div className="max-w-3xl mx-auto px-8">

        {/* Header */}
        <header className="mb-10 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#FFA800] transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="flex-1 text-center text-xl font-bold text-[#070707]">
            Food Image Data Collection &amp; Annotation
          </h1>
          <div className="w-[52px]" />
        </header>

        {/* Wallet required notice */}
        {!isLoggedIn && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-2xl bg-[rgba(255,168,0,0.06)] border border-[rgba(255,168,0,0.20)]">
            <AlertCircle className="w-5 h-5 text-[#FFA800] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#070707] mb-0.5">Wallet connection required</p>
              <p className="text-xs text-[#6B7280]">Connect your wallet via the top-right button before submitting.</p>
            </div>
          </div>
        )}

        {/* Guidelines */}
        <Card className="mb-8 space-y-6">
          <h2 className="text-base font-bold text-[#070707] flex items-center gap-2">
            📋 Guidelines
          </h2>
          <div>
            <h3 className="text-sm font-bold text-[#070707] mb-2">Task Description</h3>
            <p className="text-sm text-[#6B7280] leading-relaxed">
              This project aims to co-create a high-quality food nutrition database through the food photos you take and your precise annotations. You are required to submit a clear, aesthetically pleasing photo of a ready-to-eat dish. Please note: raw ingredients such as raw meat, raw fish, unprocessed vegetables, or unopened packaged products do not meet the requirements. Additionally, please provide an accurate food name, quantity, cooking method, and estimated calories.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#070707] mb-2">Evaluation Criteria</h3>
            <div className="space-y-2 text-sm text-[#6B7280] leading-relaxed">
              {[
                { grade: 'S', desc: 'A perfect submission—the image is clear and aesthetically pleasing, and all annotated information is accurate, reasonable, and complete.' },
                { grade: 'A', desc: 'The annotated information is generally accurate, but the image quality is poor (blurry, poor composition, dim lighting).' },
                { grade: 'B', desc: 'The annotated information contains obvious errors relative to the image content.' },
                { grade: 'C', desc: 'The annotated text information is gibberish, an ad, or completely unrelated to food.' },
                { grade: 'D', desc: 'The submitted image URL is invalid or inaccessible; no clearly discernible food in the picture.' },
              ].map(({ grade, desc }) => (
                <p key={grade}><span className="font-bold text-[#070707]">{grade}:</span> {desc}</p>
              ))}
            </div>
          </div>
        </Card>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 mb-8">

          {/* Image Upload */}
          <div>
            <label className={labelClass}>Food Image <span className="text-[#FFA800]">*</span></label>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={`rounded-2xl border-2 border-dashed p-8 flex flex-col items-center gap-3 text-center transition-all bg-white ${
                dragging ? 'border-[#FFA800] bg-[rgba(255,168,0,0.04)]' : 'border-gray-200 hover:border-[#FFA800]/40'
              }`}
            >
              {foodImage ? (
                <div className="flex items-center gap-3">
                  <Image className="w-5 h-5 text-[#FFA800]" />
                  <span className="text-sm text-[#070707]">{foodImage.name}</span>
                  <button type="button" onClick={() => setFoodImage(null)} className="ml-2 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <CloudUpload className="w-10 h-10 text-[#FFA800]/60" />
                  <div>
                    <p className="text-sm font-bold text-[#070707] mb-1">Upload Food Image</p>
                    <p className="text-xs text-[#9CA3AF]">Photos of ready-to-eat dishes. Excludes raw ingredients &amp; packaged products</p>
                  </div>
                  <label className="bg-[#070707] hover:bg-[#1A1A1A] text-white text-xs font-bold px-5 py-2 rounded-xl cursor-pointer transition-colors">
                    Browse Files
                    <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) setFoodImage(e.target.files[0]); }} />
                  </label>
                </>
              )}
            </div>
          </div>

          {[
            { label: 'Food Name', value: foodName, setter: setFoodName, placeholder: 'e.g. Grilled Salmon with Vegetables' },
            { label: 'Food Weight (in grams)', value: foodWeight, setter: setFoodWeight, placeholder: 'e.g. 350' },
            { label: 'Cooking Method', value: cookingMethod, setter: setCookingMethod, placeholder: 'e.g. Pan-fried, Steamed, Baked' },
            { label: 'Calories (kcal)', value: calories, setter: setCalories, placeholder: 'e.g. 450' },
          ].map(({ label, value, setter, placeholder }) => (
            <div key={label}>
              <label className={labelClass}>{label} <span className="text-[#FFA800]">*</span></label>
              <input type="text" value={value} onChange={e => setter(e.target.value)} placeholder={placeholder} className={inputClass} />
            </div>
          ))}

          {/* Warning */}
          <Card className="border border-red-100 bg-red-50/50 p-6 space-y-3">
            <h3 className="text-sm font-bold text-red-500 flex items-center gap-2">⚠️ Expert Redline Behaviors (One-time Elimination System)</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-[#6B7280] leading-relaxed">
              <li>Maliciously circumventing or cracking task rules; submitting large amounts of invalid or low-quality data</li>
              <li>Directly submitting AI-generated content without any manual review or annotation</li>
              <li>Dishonest behaviors such as plagiarism or delegating tasks to others</li>
              <li>Uncivilized behaviors such as verbal abuse or personal attacks</li>
              <li>Disseminating question banks, task rules, or any related confidential information</li>
            </ol>
          </Card>

          {/* Wallet status */}
          {isLoggedIn && walletAddress && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(34,197,94,0.06)] border border-[rgba(34,197,94,0.15)] text-xs">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              <span className="text-[#6B7280]">Wallet connected:</span>
              <span className="font-mono text-[#070707]">{walletAddress}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
              !submitting
                ? 'bg-[#070707] hover:bg-[#1A1A1A] text-white cursor-pointer'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Uploading &amp; Submitting…
              </span>
            ) : !isLoggedIn ? 'Connect Wallet & Submit' : 'Submit'}
          </button>
        </form>
      </div>

      {showWalletModal && <WalletModal onClose={() => setShowWalletModal(false)} />}
    </main>
  );
}
