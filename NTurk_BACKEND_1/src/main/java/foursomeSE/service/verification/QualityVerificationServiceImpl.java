package foursomeSE.service.verification;

import foursomeSE.entity.communicate.EnterResponse;
import foursomeSE.entity.task.MicrotaskStatus;
import foursomeSE.entity.verification.RVerifications;
import foursomeSE.entity.verification.VerificationType;
import foursomeSE.jpa.annotation.AnnotationJPA;
import foursomeSE.jpa.gold.GoldJPA;
import foursomeSE.jpa.task.MicrotaskJPA;
import foursomeSE.jpa.task.TaskJPA;
import foursomeSE.jpa.verification.VerificationJPA;
import foursomeSE.util.CriticalSection;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Qualifier("quality")
public class QualityVerificationServiceImpl extends AbstractVerificationServiceImpl {
    public QualityVerificationServiceImpl(MicrotaskJPA microtaskJPA, TaskJPA taskJPA, GoldJPA goldJPA, AnnotationJPA annotationJPA, VerificationJPA verificationJPA) {
        super(microtaskJPA, taskJPA, goldJPA, annotationJPA, verificationJPA);
    }

    @Override
    protected MicrotaskStatus getStt() {
        return MicrotaskStatus.YET_TO_VERIFY_QUALITY;
    }

    @Override
    protected MicrotaskStatus getSuccessfulNextStt() {
        return MicrotaskStatus.YET_TO_VERIFY_COVERAGE;
    }

    @Override
    protected MicrotaskStatus getFailedNextStt() {
        return MicrotaskStatus.YET_TO_DRAW;
    }

    @Override
    protected VerificationType getVType() {
        return VerificationType.QUALITY;
    }

    @Override
    protected List<CriticalSection.Item> getRecords() {
        return CriticalSection.qualityVerificationRecords;
    }
}