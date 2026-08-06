import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { approvalsApi, type ApprovalPreview } from '../../services/api/approvalsApi';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle, XCircle, Clock, Loader2, AlertTriangle, Share2, PencilLine, Sparkles } from 'lucide-react';

type ViewState = 'loading' | 'ready' | 'error' | 'approved' | 'changes_requested' | 'cancelled';
type Action = 'approve' | 'request_changes' | 'cancel';

const Approval: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [state, setState] = useState<ViewState>('loading');
  const [preview, setPreview] = useState<ApprovalPreview | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setState('error');
      setErrorMsg('Missing approval token.');
      return;
    }
    approvalsApi.getPreview(token)
      .then((data) => {
        setPreview(data);
        setState('ready');
      })
      .catch((err) => {
        setState('error');
        setErrorMsg(err.response?.data?.detail || 'This approval link is invalid or has expired.');
      });
  }, [token]);

  const handleDecision = async (action: Action) => {
    if (!token || isSubmitting) return;
    setIsSubmitting(true);
    try {
      if (action === 'approve') {
        await approvalsApi.approve(token);
        setState('approved');
      } else if (action === 'request_changes') {
        await approvalsApi.requestChanges(token);
        setState('changes_requested');
      } else {
        await approvalsApi.cancel(token);
        setState('cancelled');
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Something went wrong processing your decision.');
      setState('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">AG</span>
          </div>
          <span className="font-bold tracking-tight text-xl text-text-primary">AI Growth Agent</span>
        </div>

        <Card className="border-border shadow-md">
          {state === 'loading' && (
            <CardContent className="p-12 flex flex-col items-center text-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-text-secondary text-sm">Loading approval request...</p>
            </CardContent>
          )}

          {state === 'error' && (
            <CardContent className="p-12 flex flex-col items-center text-center gap-3">
              <AlertTriangle className="w-10 h-10 text-danger" />
              <h2 className="text-lg font-bold text-text-primary">Unable to load this approval</h2>
              <p className="text-text-secondary text-sm">{errorMsg}</p>
            </CardContent>
          )}

          {state === 'approved' && (
            <CardContent className="p-12 flex flex-col items-center text-center gap-3">
              <CheckCircle className="w-10 h-10 text-success" />
              <h2 className="text-lg font-bold text-text-primary">Post approved</h2>
              <p className="text-text-secondary text-sm">
                This post has been approved and will publish as scheduled.
              </p>
            </CardContent>
          )}

          {state === 'changes_requested' && (
            <CardContent className="p-12 flex flex-col items-center text-center gap-3">
              <PencilLine className="w-10 h-10 text-warning" />
              <h2 className="text-lg font-bold text-text-primary">Regenerating this post</h2>
              <p className="text-text-secondary text-sm">
                The AI is drafting a new version. You'll get a fresh approval email shortly.
              </p>
            </CardContent>
          )}

          {state === 'cancelled' && (
            <CardContent className="p-12 flex flex-col items-center text-center gap-3">
              <XCircle className="w-10 h-10 text-danger" />
              <h2 className="text-lg font-bold text-text-primary">Post cancelled</h2>
              <p className="text-text-secondary text-sm">
                This post will not be published.
              </p>
            </CardContent>
          )}

          {state === 'ready' && preview && (
            <>
              <CardHeader className="space-y-1 pb-4">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Share2 className="w-5 h-5 text-primary" />
                  Approval needed: {preview.platform_name || 'Post'}
                </CardTitle>
                {preview.scheduled_time && (
                  <p className="text-sm text-text-secondary flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    Scheduled for {new Date(preview.scheduled_time).toLocaleString()}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-background border border-border rounded-xl p-5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-text-muted mb-2">
                    {preview.platform_name || 'Content'} Preview
                  </div>
                  {preview.image_url && (
                    <div className="mb-3">
                      <img
                        src={preview.image_url}
                        alt="Selected post visual"
                        className="w-full rounded-lg object-cover max-h-64"
                      />
                      {preview.image_attribution && (
                        <p className="text-[11px] text-text-muted mt-1">{preview.image_attribution}</p>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">
                    {preview.content_preview || 'No preview available.'}
                  </p>
                </div>

                {(preview.quality_score || preview.ai_reasoning) && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI Quality Review{preview.quality_score ? ` - ${preview.quality_score}/10` : ''}
                    </div>
                    {preview.ai_reasoning && (
                      <p className="text-sm text-text-secondary">{preview.ai_reasoning}</p>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    className="flex-1 gap-2 bg-success hover:bg-success/90 border-none"
                    onClick={() => handleDecision('approve')}
                    isLoading={isSubmitting}
                  >
                    <CheckCircle className="w-4 h-4" /> Approve &amp; Publish
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => handleDecision('request_changes')}
                    isLoading={isSubmitting}
                  >
                    <PencilLine className="w-4 h-4" /> Request Changes
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1 gap-2"
                    onClick={() => handleDecision('cancel')}
                    isLoading={isSubmitting}
                  >
                    <XCircle className="w-4 h-4" /> Cancel
                  </Button>
                </div>

                <p className="text-xs text-text-muted text-center">
                  This link expires on {new Date(preview.expires_at).toLocaleString()}
                </p>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Approval;
