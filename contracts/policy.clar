;; Policy Contract

;; Define data structures
(define-map policies
  { policy-id: uint }
  {
    owner: principal,
    premium: uint,
    coverage: uint,
    start-date: uint,
    end-date: uint,
    is-active: bool,
    parameters: (list 10 (tuple (key (string-utf8 64)) (value (string-utf8 64))))
  }
)

(define-data-var next-policy-id uint u1)

;; Error codes
(define-constant err-policy-not-found (err u100))
(define-constant err-unauthorized (err u101))
(define-constant err-invalid-dates (err u102))

;; Functions
(define-public (create-policy (premium uint) (coverage uint) (start-date uint) (end-date uint) (parameters (list 10 (tuple (key (string-utf8 64)) (value (string-utf8 64))))))
  (let
    ((policy-id (var-get next-policy-id)))
    (asserts! (> end-date start-date) err-invalid-dates)
    (map-set policies
      { policy-id: policy-id }
      {
        owner: tx-sender,
        premium: premium,
        coverage: coverage,
        start-date: start-date,
        end-date: end-date,
        is-active: true,
        parameters: parameters
      }
    )
    (var-set next-policy-id (+ policy-id u1))
    (ok policy-id)
  )
)

(define-public (cancel-policy (policy-id uint))
  (let
    ((policy (unwrap! (map-get? policies { policy-id: policy-id }) err-policy-not-found)))
    (asserts! (is-eq (get owner policy) tx-sender) err-unauthorized)
    (ok (map-set policies
      { policy-id: policy-id }
      (merge policy { is-active: false })
    ))
  )
)

(define-read-only (get-policy (policy-id uint))
  (map-get? policies { policy-id: policy-id })
)

(define-read-only (is-policy-active (policy-id uint))
  (default-to
    false
    (get is-active (map-get? policies { policy-id: policy-id }))
  )
)

