package foursomeSE.entity;

import foursomeSE.entity.verification.VerificationType;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.validation.constraints.NotNull;

@Entity
public class Gold {
    @Id
    @GeneratedValue
    public long id;

    @NotNull
    public long annotationId;

    @NotNull
    public long taskId;

    @NotNull
    public int ord;

    @NotNull
    public VerificationType verificationType;
}
