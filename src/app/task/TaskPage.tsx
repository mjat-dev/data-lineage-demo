import { useState, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CloudUpload, X, CheckCircle2, AlertCircle, Eye, Trash2 } from 'lucide-react';
import { Input, Button as AntButton, ConfigProvider, Spin, message } from 'antd';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/Card';
import { uploadFile, submitTask } from '@/lib/api';
import WalletModal from '@/components/WalletModal';

export default function TaskPage() {
  const navigate = useNavigate();
  const { walletAddress, isLoggedIn, setSubmission } = useApp();

  const [foodImage, setFoodImage] = useState<File | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [foodName, setFoodName] = useState('');
  const [foodWeight, setFoodWeight] = useState('');
  const [cookingMethod, setCookingMethod] = useState('');
  const [calories, setCalories] = useState('');
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const previewUrl = useMemo(() => foodImage ? URL.createObjectURL(foodImage) : null, [foodImage]);

  // Upload image immediately on selection
  const handleImageSelect = useCallback(async (file: File) => {
    setFoodImage(file);
    setUploadedImageUrl(null);
    setImageUploading(true);
    try {
      const url = await uploadFile(file);
      setUploadedImageUrl(url);
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'Image upload failed');
      setFoodImage(null);
    } finally {
      setImageUploading(false);
    }
  }, []);

  const handleRemoveImage = useCallback(() => {
    setFoodImage(null);
    setUploadedImageUrl(null);
  }, []);

  // IDs stored by Frontier page when user clicks a frontier card
  const taskId = sessionStorage.getItem('codatta_task_id') || '10318807159400100038';
  const templateId = sessionStorage.getItem('codatta_template_id') || 'MVP_DEMO_TPL';

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file);
  };

  const formFilled = !!(uploadedImageUrl && foodName.trim() && foodWeight.trim() && cookingMethod.trim() && calories.trim());

  const doSubmit = async () => {
    if (!uploadedImageUrl) return;
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitTask({
        taskId,
        templateId,
        data: {
          food_name: foodName.trim(),
          food_weight: foodWeight.trim(),
          cooking_method: cookingMethod.trim(),
          calories: calories.trim(),
          food_image: uploadedImageUrl,
        },
      });

      setSubmission({
        id: result.submission_id,
        foodName: foodName.trim(),
        foodWeight: foodWeight.trim(),
        cookingMethod: cookingMethod.trim(),
        calories: calories.trim(),
        foodImageName: foodImage!.name,
        foodImageUrl: uploadedImageUrl,
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

  const labelClass = "text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF] block mb-2";

  return (
    <ConfigProvider theme={{ token: { colorPrimary: '#070707', borderRadius: 10, fontSize: 14 } }}>
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
              {foodImage && previewUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <Spin spinning={imageUploading}>
                    <div className="relative group w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
                      <img src={uploadedImageUrl || previewUrl} alt={foodImage.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100">
                        <button type="button" onClick={() => setShowPreview(true)} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/60 transition-all">
                          <Eye className="w-4 h-4" style={{ color: '#fff' }} />
                        </button>
                        <button type="button" onClick={handleRemoveImage} className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-red-500/80 hover:border-red-400/40 transition-all">
                          <Trash2 className="w-4 h-4" style={{ color: '#fff' }} />
                        </button>
                      </div>
                      <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1 truncate">{foodImage.name}</p>
                    </div>
                  </Spin>
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
                    <input type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleImageSelect(e.target.files[0]); }} />
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
              <Input
                value={value}
                onChange={e => setter(e.target.value)}
                placeholder={placeholder}
                size="large"
                allowClear
              />
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
          <AntButton
            htmlType="submit"
            type="primary"
            size="large"
            block
            loading={submitting}
            disabled={submitting}
            style={{ height: 48, borderRadius: 12, fontWeight: 700 }}
          >
            {submitting ? 'Submitting…' : !isLoggedIn ? 'Connect Wallet & Submit' : 'Submit'}
          </AntButton>
        </form>
      </div>

      {showWalletModal && <WalletModal onClose={() => setShowWalletModal(false)} />}

      {/* Image preview modal */}
      {showPreview && previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowPreview(false)}
        >
          <button onClick={() => setShowPreview(false)} className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <img src={previewUrl} alt={foodImage?.name} className="max-w-full max-h-[85vh] rounded-xl object-contain" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </main>
    </ConfigProvider>
  );
}
